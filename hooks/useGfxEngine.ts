
import { useState, useCallback } from 'react';
import { ImageState } from '../types';
import { editImage } from '../services/geminiService';

export const useGfxEngine = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composite = useCallback(async (originalUrl: string, editedUrl: string, maskUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const imgOrg = new Image();
      const imgEdit = new Image();
      const imgMask = new Image();

      let loaded = 0;
      const checkLoaded = () => {
        loaded++;
        if (loaded === 3) {
          canvas.width = imgOrg.width;
          canvas.height = imgOrg.height;
          ctx.drawImage(imgOrg, 0, 0);

          const editCanvas = document.createElement('canvas');
          editCanvas.width = canvas.width;
          editCanvas.height = canvas.height;
          const editCtx = editCanvas.getContext('2d')!;

          editCtx.drawImage(imgMask, 0, 0, canvas.width, canvas.height);
          editCtx.globalCompositeOperation = 'source-in';
          editCtx.drawImage(imgEdit, 0, 0, canvas.width, canvas.height);

          ctx.drawImage(editCanvas, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        }
      };

      imgOrg.onload = checkLoaded;
      imgEdit.onload = checkLoaded;
      imgMask.onload = checkLoaded;
      imgOrg.onerror = imgEdit.onerror = imgMask.onerror = () => reject("Erro ao carregar imagens para composição.");
      
      imgOrg.src = originalUrl;
      imgEdit.src = editedUrl;
      imgMask.src = maskUrl;
    });
  }, []);

  const renderGfx = async (source: ImageState, prompt: string, mask: string | null) => {
    setIsProcessing(true);
    setError(null);
    try {
      const enrichedPrompt = mask 
        ? `${prompt} (Foque as alterações APENAS na área destacada pela máscara. O restante da imagem deve permanecer idêntico.)`
        : prompt;

      const aiUrl = await editImage(source, enrichedPrompt);
      let finalUrl = aiUrl;

      if (mask) {
        finalUrl = await composite(source.url, aiUrl, mask);
      }

      return finalUrl;
    } catch (err: any) {
      setError(err.message || "Falha na renderização GFX.");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, renderGfx };
};
