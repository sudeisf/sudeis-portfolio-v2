import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cache instances
let supabaseInstance: any = null;
let cloudinaryConfigured = false;

// Initialize Supabase lazily and safely
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("⚠️ Supabase credentials not fully configured in environment variables. Falling back to local/in-memory storage.");
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey);
    console.log("⚡ Supabase Client initialized successfully.");
    return supabaseInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error);
    return null;
  }
}

// Initialize Cloudinary lazily and safely
export function configureCloudinary() {
  if (cloudinaryConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("⚠️ Cloudinary credentials not fully configured in environment variables. Image uploads will fall back to Base64/local.");
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    cloudinaryConfigured = true;
    console.log("⚡ Cloudinary SDK configured successfully.");
    return true;
  } catch (error) {
    console.error("❌ Failed to configure Cloudinary:", error);
    return false;
  }
}

/**
 * Uploads a Base64 file or media URL to Cloudinary
 * Supports both images and videos
 */
export async function uploadToCloudinary(base64Data: string, resourceType: 'image' | 'video' | 'auto' = 'auto'): Promise<string> {
  const isConfigured = configureCloudinary();
  if (!isConfigured) {
    throw new Error("Cloudinary is not configured. Please supply Cloudinary env variables in settings.");
  }

  try {
    // If the string starts with data:xxx;base64, it's a data URI
    // Cloudinary natively supports uploading base64 data URIs
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      resource_type: resourceType,
      folder: 'sudeis_portfolio'
    });
    return uploadResult.secure_url;
  } catch (error: any) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new Error(error.message || "Cloudinary upload failed.");
  }
}

// Simple in-memory fallback database to keep state synchronized for sessions when Supabase is unconfigured
const memoryDb: Record<string, any> = {};

/**
 * Generic getter for Supabase key-value data storage
 * Falls back to in-memory if Supabase is unavailable
 * Schema used in Supabase:
 * Table: portfolio_settings
 * Columns:
 *  - key: text (primary key)
 *  - value: jsonb
 */
export async function getPortfolioData(key: string, defaultValue: any): Promise<any> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return memoryDb[key] !== undefined ? memoryDb[key] : defaultValue;
  }

  try {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Row not found, which is normal for initial runs
        return defaultValue;
      }
      // Table might not exist yet, let's notify and fallback
      if (error.message && error.message.includes('relation "portfolio_settings" does not exist')) {
        console.warn(`⚠️ Table "portfolio_settings" does not exist in your Supabase project yet. Please create it or use our auto-fallback. Querying fallback.`);
      } else {
        console.error(`Supabase fetch error for key "${key}":`, error);
      }
      return memoryDb[key] !== undefined ? memoryDb[key] : defaultValue;
    }

    return data?.value ?? defaultValue;
  } catch (err) {
    console.error(`Error querying Supabase for "${key}":`, err);
    return memoryDb[key] !== undefined ? memoryDb[key] : defaultValue;
  }
}

/**
 * Generic setter for Supabase key-value data storage
 */
export async function setPortfolioData(key: string, value: any): Promise<boolean> {
  // Always update our local memory store as cache/fallback
  memoryDb[key] = value;

  const supabase = getSupabaseClient();
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      if (error.message && error.message.includes('relation "portfolio_settings" does not exist')) {
        console.warn(`⚠️ Table "portfolio_settings" does not exist in your Supabase project. Saving to memory fallback. Please run the SQL setup script to create the table in Supabase.`);
      } else {
        console.error(`Supabase upsert error for key "${key}":`, error);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error saving to Supabase for "${key}":`, err);
    return false;
  }
}

// SQL Script helper for the user
export const SUPABASE_SQL_SETUP = `
-- Run this SQL query in your Supabase SQL Editor to create the tables required for your Sudeis Fedlu Portfolio!

CREATE TABLE IF NOT EXISTS portfolio_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable row-level security (RLS)
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read the public settings but editing requires auth (or allow public access for your simple preview)
CREATE POLICY "Allow public read access" ON portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Allow public upsert access" ON portfolio_settings FOR ALL USING (true);
`;
