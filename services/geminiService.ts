
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageState } from "../types";

const SYSTEM_INSTRUCTION = `Você é ØRYK, um artista de GFX e thumbnails de Roblox de classe mundial.
Seu objetivo é transformar capturas de tela do Roblox em thumbnails profissionais de alta qualidade.
Mantenha sempre o visual icônico "blocky" do Roblox, mas adicione efeitos visuais de alta fidelidade como:
- Iluminação volumétrica (Godrays)
- Materiais realistas (plástico PBR, reflexos em neon)
- Profundidade de campo cinematográfica
- Efeitos de partícula e aura vibrantes
- Ambientação de jogos populares (Blox Fruits, Brookhaven, Pet Simulator 99).
Priorize uma estética de alta energia, colorida e chamativa.`;

export const editImage = async (
  image: ImageState,
  prompt: string
): Promise<string> => {
  // Sempre criar uma nova instância para capturar a chave de API mais recente do ambiente
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Chave de API não configurada. Por favor, conecte sua conta.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Usando gemini-3-pro-image-preview para máxima qualidade GFX
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType,
            },
          },
          {
            text: `${SYSTEM_INSTRUCTION}\n\nPedido do Usuário: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9" // Otimizado para Thumbnails de Youtube/Roblox
        }
      }
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
      const errorMsg = response.text || "";
      if (errorMsg.includes("quota") || errorMsg.includes("exhausted")) {
        throw new Error("Cota de API excedida. Use uma chave de um projeto com faturamento ativo.");
      }
      throw new Error("O modelo não conseguiu gerar a atualização visual.");
    }

    return `data:image/png;base64,${resultImageBase64}`;
  } catch (error: any) {
    console.error("ØRYK Engine Error:", error);
    if (error.message?.includes("429")) {
      throw new Error("Limite de requisições atingido. Aguarde um momento ou troque sua API Key.");
    }
    throw new Error(error.message || "Falha na renderização da imagem.");
  }
};
