
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageState } from "../types";

const API_KEY = process.env.API_KEY || "";

const SYSTEM_INSTRUCTION = `You are ØRYK, a world-class Roblox GFX and thumbnail artist. 
Your goal is to transform Roblox screenshots and renders into professional-grade thumbnails.
Common tasks: Adding volumetric lighting (Godrays), glowing eyes to avatars, realistic plastic or cloth textures, motion blur, and cinematic backgrounds (Bloxburg, Brookhaven, or simulator styles).
Always maintain the iconic blocky look of Roblox while adding high-fidelity visual effects. 
If the user provides a prompt, prioritize the high-energy, colorful, and click-worthy aesthetic popular on the Roblox platform.`;

export const editImage = async (
  image: ImageState,
  prompt: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType,
            },
          },
          {
            text: `${SYSTEM_INSTRUCTION}\n\nUser Request: ${prompt}`,
          },
        ],
      },
    });

    let resultImageBase64 = "";
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!resultImageBase64) {
      throw new Error(response.text || "Model failed to generate a visual update.");
    }

    return `data:image/png;base64,${resultImageBase64}`;
  } catch (error: any) {
    console.error("ØRYK Error:", error);
    throw new Error(error.message || "Failed to edit image.");
  }
};
