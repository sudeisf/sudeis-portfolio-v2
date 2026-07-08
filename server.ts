import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import { getPortfolioData, setPortfolioData, uploadToCloudinary, SUPABASE_SQL_SETUP } from './server/integrations.js';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();

// Support JSON request bodies with an increased limit for media uploads (base64 images/videos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Route for AI Resume Generation/Enhancement
app.post('/api/resume/generate', async (req, res) => {
  try {
    const { task, payload } = req.body;
    const client = getGeminiClient();

    if (task === 'generate_full') {
      const prompt = `Generate a fully populated professional ATS-friendly resume JSON object for a Full Stack Developer.
Use these input notes:
${payload.notes}

Ensure the output is strictly structured as requested by the schema. All experiences must have 3-4 professional action-verb bullet points. Make sure to generate random unique IDs for experiences and education.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              title: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              website: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              github: { type: Type.STRING },
              summary: { type: Type.STRING },
              skills: {
                type: Type.OBJECT,
                properties: {
                  languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tools: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['languages', 'frameworks', 'tools']
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.STRING, description: "Bullet points separated by newline (\\n) starting with strong action verbs (e.g. • Architected...)" }
                  },
                  required: ['id', 'role', 'company', 'location', 'period', 'description']
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    details: { type: Type.STRING }
                  },
                  required: ['id', 'degree', 'school', 'location', 'period']
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'description', 'technologies']
                }
              }
            },
            required: ['name', 'title', 'email', 'phone', 'location', 'summary', 'skills', 'experience', 'education', 'projects']
          }
        }
      });

      const result = response.text;
      return res.json(JSON.parse(result));

    } else if (task === 'enhance_summary') {
      const prompt = `Optimize the following professional summary for an ATS-friendly, high-impact resume. It should be concise (2-4 sentences), outcome-oriented, and highlight core developer competencies.
Draft:
${payload.summary}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an ATS professional resume optimization tool. Output ONLY the optimized summary paragraph, with no extra text or labels."
        }
      });

      return res.json({ result: response.text.trim() });

    } else if (task === 'enhance_experience') {
      const prompt = `Optimize the following work experience into 3-4 professional, ATS-friendly bullet points using the STAR method (Situation, Task, Action, Result).
Each bullet point MUST start with a strong action verb (e.g., Developed, Optimized, Reduced, Architected) and showcase metrics/impact where possible.
Role: ${payload.role}
Company: ${payload.company}
Location: ${payload.location}
Period: ${payload.period}
Draft description or details:
${payload.description}

Format the output strictly as a list of bullet points starting with '• ', separated by newlines.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an ATS resume editor. Rewrite experience details into 3-4 professional action bullet points. Output ONLY the bullet points, starting with '• '."
        }
      });

      return res.json({ result: response.text.trim() });
    }

    return res.status(400).json({ error: "Unsupported task type." });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI content." });
  }
});

// --- SUPABASE & CLOUDINARY API ROUTES ---

// Get full portfolio data (Hero image, about image, projects, resume data)
app.get('/api/portfolio', async (req, res) => {
  try {
    const heroImage = await getPortfolioData('heroImage', null);
    const aboutImage = await getPortfolioData('aboutImage', null);
    const projects = await getPortfolioData('projects', null);
    const adminEmail = await getPortfolioData('adminEmail', 'sudeisfed@gmail.com');
    const passcode = await getPortfolioData('passcode', 'sudeis2026');
    const resumeSourceSettings = await getPortfolioData('resumeSourceSettings', null);
    const resumeData = await getPortfolioData('resumeData', null);

    res.json({
      heroImage,
      aboutImage,
      projects,
      adminEmail,
      passcode,
      resumeSourceSettings,
      resumeData
    });
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ error: "Failed to fetch portfolio settings from database." });
  }
});

// Save specific portfolio keys
app.post('/api/portfolio', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Missing 'key' in request body." });
    }

    const success = await setPortfolioData(key, value);
    res.json({ success: true, message: `Successfully updated '${key}'`, databaseSaved: success });
  } catch (error: any) {
    console.error("Error saving portfolio:", error);
    res.status(500).json({ error: error.message || "Failed to update portfolio settings." });
  }
});

// Get contact inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await getPortfolioData('inquiries', []);
    res.json(inquiries);
  } catch (error: any) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries." });
  }
});

// Post a new contact inquiry
app.post('/api/inquiries', async (req, res) => {
  try {
    const newInquiry = req.body;
    if (!newInquiry.name || !newInquiry.email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    // Add unique ID and timestamp if not present
    if (!newInquiry.id) newInquiry.id = 'inq-' + Date.now();
    if (!newInquiry.date) newInquiry.date = new Date().toISOString();

    const existingInquiries = await getPortfolioData('inquiries', []);
    const updatedInquiries = [newInquiry, ...existingInquiries];

    await setPortfolioData('inquiries', updatedInquiries);
    res.json({ success: true, inquiry: newInquiry });
  } catch (error: any) {
    console.error("Error saving inquiry:", error);
    res.status(500).json({ error: "Failed to save contact inquiry." });
  }
});

// Delete/Clear inquiries (for admin)
app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingInquiries = await getPortfolioData('inquiries', []);
    const updatedInquiries = existingInquiries.filter((inq: any) => inq.id !== id);
    await setPortfolioData('inquiries', updatedInquiries);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ error: "Failed to delete inquiry." });
  }
});

// Cloudinary Upload endpoint for images and videos
app.post('/api/upload', async (req, res) => {
  try {
    const { file, resourceType } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No media file/Base64 string provided." });
    }

    const uploadedUrl = await uploadToCloudinary(file, resourceType || 'auto');
    res.json({ url: uploadedUrl });
  } catch (error: any) {
    console.error("Cloudinary upload route error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file to Cloudinary." });
  }
});

// Supabase SQL Helper endpoint
app.get('/api/supabase-sql', (req, res) => {
  res.json({ sql: SUPABASE_SQL_SETUP });
});

// Export default Express app for serverless deployment platforms (like Vercel)
export default app;

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const viteModule = await import('vite');
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only run standalone HTTP server if NOT running on serverless Vercel function
if (!process.env.VERCEL) {
  startServer();
}
