import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;
let cloudinaryConfigured = false;

function isValidSupabaseUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveSupabaseKey(): string | null {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceRole) return serviceRole;

  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (anonKey) {
    console.warn(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Using anon key — writes may fail until you add the service role key or run the SQL migration.'
    );
    return anonKey;
  }

  return null;
}

/** Server-side Supabase client (prefers service role so writes bypass RLS). */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL?.trim();
  const key = resolveSupabaseKey();

  if (!url || !key) {
    console.warn('⚠️ Supabase not configured. Data falls back to in-memory storage (lost on restart).');
    return null;
  }

  if (!isValidSupabaseUrl(url) || url.includes('placeholder') || url.includes('<your-') || url.includes('YOUR_')) {
    console.warn('⚠️ Supabase URL is invalid or a placeholder. Falling back to in-memory storage.');
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    console.log('⚡ Supabase client initialized.');
    return supabaseInstance;
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export function hasSupabaseServiceRole(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

/** Returns true when the portfolio_settings table exists and is reachable. */
export async function isSupabaseTableReady(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('portfolio_settings').select('key').limit(1);
    if (!error) return true;
    if (error.message?.includes('portfolio_settings') && error.message?.includes('does not exist')) {
      return false;
    }
    // Permission errors usually mean table exists but key lacks access
    return !error.message?.includes('does not exist');
  } catch {
    return false;
  }
}

export function configureCloudinary(): boolean {
  if (cloudinaryConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    cloudinaryConfigured = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to configure Cloudinary:', error);
    return false;
  }
}

export function isCloudinaryConfigured(): boolean {
  return configureCloudinary();
}

/** Direct browser → Cloudinary uploads (faster than base64 via server). */
export function isDirectUploadEnabled(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  return !!(cloudName && uploadPreset);
}

export function getCloudinaryUploadConfig(): { cloudName: string; uploadPreset: string } | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) return null;
  return { cloudName, uploadPreset };
}

export async function uploadToCloudinary(
  base64Data: string,
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> {
  if (!configureCloudinary()) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_* environment variables.');
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      resource_type: resourceType,
      folder: 'sudeis_portfolio',
    });
    return uploadResult.secure_url;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cloudinary upload failed.';
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error(message);
  }
}

const memoryDb: Record<string, unknown> = {};

export async function getPortfolioData<T>(key: string, defaultValue: T): Promise<T> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return (memoryDb[key] !== undefined ? memoryDb[key] : defaultValue) as T;
  }

  try {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      if (error.message?.includes('portfolio_settings') && error.message?.includes('does not exist')) {
        console.warn('⚠️ Table portfolio_settings does not exist. Run the SQL in supabase/migrations/ or Admin → Security.');
      } else {
        console.error(`Supabase fetch error for "${key}":`, error);
      }
      return (memoryDb[key] !== undefined ? memoryDb[key] : defaultValue) as T;
    }

    if (data?.value === null || data?.value === undefined) {
      return defaultValue;
    }

    return data.value as T;
  } catch (err) {
    console.error(`Error querying Supabase for "${key}":`, err);
    return (memoryDb[key] !== undefined ? memoryDb[key] : defaultValue) as T;
  }
}

export async function setPortfolioData(key: string, value: unknown): Promise<boolean> {
  memoryDb[key] = value;

  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      if (error.message?.includes('portfolio_settings') && error.message?.includes('does not exist')) {
        console.warn('⚠️ Table portfolio_settings does not exist. Run the SQL migration in Supabase.');
      } else {
        console.error(`Supabase upsert error for "${key}":`, error);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error saving to Supabase for "${key}":`, err);
    return false;
  }
}

/** Create empty rows for CMS keys when the table exists but has no data yet. */
export async function seedPortfolioDatabase(): Promise<{ seeded: string[]; skipped: string[] }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data: existing, error } = await supabase.from('portfolio_settings').select('key');
  if (error) {
    throw new Error(error.message || 'Could not read portfolio_settings table.');
  }

  const existingKeys = new Set((existing || []).map((row) => row.key));
  const seeded: string[] = [];
  const skipped: string[] = [];

  const defaults: Record<string, unknown> = {
    heroImage: null,
    aboutImage: null,
    projects: [],
    inquiries: [],
    resumeSourceSettings: null,
    resumeData: null,
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (existingKeys.has(key)) {
      skipped.push(key);
      continue;
    }
    await setPortfolioData(key, value);
    seeded.push(key);
  }

  return { seeded, skipped };
}

function loadSqlSetup(): string {
  try {
    return readFileSync(join(process.cwd(), 'supabase/migrations/001_portfolio_settings.sql'), 'utf8');
  } catch {
    return SUPABASE_SQL_SETUP_FALLBACK;
  }
}

const SUPABASE_SQL_SETUP_FALLBACK = `
CREATE TABLE IF NOT EXISTS portfolio_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
`;

export const SUPABASE_SQL_SETUP = loadSqlSetup();
