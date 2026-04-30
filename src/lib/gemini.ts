import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateText(prompt: string, systemInstruction?: string, model: string = "gemini-3-flash-preview") {
  const response = await ai.models.generateContent({
    model: model as any,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: systemInstruction ? { systemInstruction } : undefined,
  });
  return response.text;
}

export async function generateStructuredFeedback(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview" as any,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI feedback JSON:", e);
    return null;
  }
}

export async function analyzeResume(fileBase64: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview" as any,
    contents: [
      {
        role: 'user',
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
  return response.text;
}

export async function sendChatMessage(messages: any[], systemInstruction?: string, model: string = "gemini-3-flash-preview") {
  const contents = messages.map((m: any) => ({
    role: m.role,
    parts: [{ text: m.content || m.text }]
  }));

  const response = await ai.models.generateContent({
     model: model as any,
     contents: contents,
     config: systemInstruction ? { systemInstruction } : undefined,
  });

  return { text: response.text };
}

export async function generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  const response = await ai.models.generateContent({
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
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { data: part.inlineData.data };
    }
  }
  
  return null;
}


