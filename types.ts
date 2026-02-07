
export interface ImageState {
  url: string;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  original: ImageState;
  result: ImageState;
  prompt: string;
  timestamp: number;
  mask?: string;
}

export type GfxViewMode = 'slider' | 'side-by-side' | 'brush';
