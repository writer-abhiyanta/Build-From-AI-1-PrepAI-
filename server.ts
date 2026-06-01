import express from "express";
import path from "path";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Initialize Google Gen AI
function getAI(req?: express.Request): GoogleGenAI {
  const envKey = process.env.GEMINI_API_KEY || "";
  const clientKey = req?.headers['x-gemini-key'] as string;
  const key = (clientKey && clientKey.trim() && clientKey !== "undefined") ? clientKey.trim() : envKey;

  if (!key || key === 'MY_GEMINI_API_KEY' || key.includes('your_api_key') || key === 'undefined') {
    throw new Error('Please configure a valid Gemini API key in the Secrets panel or the custom settings panel.');
  }

  return new GoogleGenAI({ 
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Routes

app.get("/api/config/status", (req, res) => {
  const envKey = process.env.GEMINI_API_KEY || "";
  const hasServerKey = !!(envKey && envKey !== 'MY_GEMINI_API_KEY' && !envKey.includes('your_api_key'));
  res.json({ hasServerKey });
});

app.post("/api/gemini/text", async (req, res) => {
  try {
    const { prompt, systemInstruction, model = "gemini-3-flash-preview" } = req.body;
    const response = await getAI(req).models.generateContent({
      model: model as any,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/text:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/feedback", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await getAI(req).models.generateContent({
      model: "gemini-3-flash-preview" as any,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert interview coach acting as a Senior Hiring Manager. Analyze the user's response to an interview question. Provide feedback in a strict JSON format focusing on Content, Tone, Clarity, and specific common mistakes like filler words, STAR method usage, and example clarity.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: {
              type: Type.OBJECT,
              properties: {
                analysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["analysis", "strengths", "improvements"]
            },
            tone: {
               type: Type.OBJECT,
               properties: {
                 analysis: { type: Type.STRING },
                 advice: { type: Type.STRING }
               },
               required: ["analysis", "advice"]
            },
            clarity: {
               type: Type.OBJECT,
               properties: {
                 score: { type: Type.NUMBER },
                 analysis: { type: Type.STRING }
               },
               required: ["score", "analysis"]
            },
            fillerWords: {
               type: Type.OBJECT,
               properties: {
                 count: { type: Type.NUMBER },
                 examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                 analysis: { type: Type.STRING }
               },
               required: ["count", "examples", "analysis"]
            },
            starMethod: {
               type: Type.OBJECT,
               properties: {
                 used: { type: Type.BOOLEAN },
                 analysis: { type: Type.STRING }
               },
               required: ["used", "analysis"]
            },
            examples: {
               type: Type.OBJECT,
               properties: {
                 clarity: { type: Type.STRING },
                 advice: { type: Type.STRING }
               },
               required: ["clarity", "advice"]
            },
            actionableTip: { type: Type.STRING }
          },
          required: ["content", "tone", "clarity", "fillerWords", "starMethod", "examples", "actionableTip"]
        }
      }
    });

    let feedback;
    try {
      feedback = JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse AI feedback JSON:", e);
      feedback = null;
    }
    res.json({ feedback });
  } catch (error: any) {
    console.error("Error in /api/gemini/feedback:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/resume", async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body;
    const response = await getAI(req).models.generateContent({
      model: "gemini-3-flash-preview" as any,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType,
              }
            },
            { text: "Analyze this resume and suggest 3-5 suitable job roles. For each role, explain why the candidate is a good fit based on their experience and skills. Also, provide 2-3 areas of improvement to make the resume stronger." }
          ]
        }
      ]
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/resume:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, model = "gemini-3-flash-preview" } = req.body;
    const contents = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content || m.text }]
    }));

    const response = await getAI(req).models.generateContent({
      model: model as any,
      contents: contents,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/image", async (req, res) => {
  try {
    const { prompt, size = "1K" } = req.body;
    const response = await getAI(req).models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // @ts-ignore
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });

    let data = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        data = part.inlineData.data;
        break;
      }
    }
    res.json({ data });
  } catch (error: any) {
    console.error("Error in /api/gemini/image:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
