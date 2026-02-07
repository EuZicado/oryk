
import React, { useState } from 'react';
import { ImageState, HistoryItem, GfxViewMode } from '../types';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';
import BrushCanvas from './BrushCanvas';
import ComparisonSlider from './ComparisonSlider';
import { useGfxEngine } from '../hooks/useGfxEngine';

export const GfxStudio: React.FC = () => {
  const [source, setSource] = useState<ImageState | null>(null);
  const [result, setResult] = useState<ImageState | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isBrushMode, setIsBrushMode] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [currentMask, setCurrentMask] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<GfxViewMode>('brush');

  const { isProcessing, error, renderGfx } = useGfxEngine();

  const handleEdit = async () => {
    if (!source || !prompt.trim()) return;

    try {
      const finalUrl = await renderGfx(source, prompt, currentMask);
      const newResult: ImageState = { url: finalUrl, base64: finalUrl.split(',')[1], mimeType: 'image/png' };
      setResult(newResult);
      setViewMode('slider');
      
      setHistory(prev => [{
        id: Date.now().toString(),
        original: source,
        result: newResult,
        prompt: prompt,
        timestamp: Date.now(),
        mask: currentMask || undefined
      }, ...prev].slice(0, 10));
    } catch (e) { /* Erro gerenciado no hook */ }
  };

  const handleUpload = (img: ImageState) => {
    setSource(img);
    setResult(null);
    setCurrentMask(null);
    setIsBrushMode(false);
    setViewMode('brush');
  };

  const handleReset = () => {
    setSource(null);
    setResult(null);
    setPrompt('');
    setCurrentMask(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {!source ? (
        <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Transforme seu <br/> <span className="text-purple-500">Roblox GFX</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">
              Suba um screenshot e descreva sua visão. A IA da ØRYK cuida do resto com qualidade profissional.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <ImageUpload onUpload={handleUpload} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Editor Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-2 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setIsBrushMode(!isBrushMode); setViewMode('brush'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isBrushMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/></svg>
                  {isBrushMode ? 'Pincel Ativo' : 'Modo Pincel'}
                </button>
                {isBrushMode && (
                  <input 
                    type="range" min="10" max="150" value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-24 accent-purple-500 ml-2"
                  />
                )}
                {result && (
                  <>
                    <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
                    <button 
                      onClick={() => setViewMode(viewMode === 'slider' ? 'brush' : 'slider')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'slider' ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {viewMode === 'slider' ? 'Ver Edição' : 'Comparar'}
                    </button>
                  </>
                )}
              </div>
              <button onClick={handleReset} className="text-[10px] font-black uppercase text-zinc-500 hover:text-red-400 transition-colors px-3">Reiniciar</button>
            </div>

            {/* Viewport */}
            <div className="aspect-video bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 relative shadow-2xl flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}

              {viewMode === 'slider' && result ? (
                <ComparisonSlider original={source.url} edited={result.url} />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <div className="relative inline-block max-w-full max-h-full">
                    <img src={source.url} className="max-w-full max-h-full rounded-lg" alt="Alvo" />
                    <BrushCanvas imageSrc={source.url} brushSize={brushSize} onMaskChange={setCurrentMask} isActive={isBrushMode} />
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl text-xs font-bold backdrop-blur-md">
                  {error}
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-3xl p-2 items-center">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                  placeholder="Ex: 'Adicione raios de sol volumétricos e olhos brilhantes roxos no avatar'..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white px-6 py-4 placeholder:text-zinc-700 font-medium"
                />
                <button 
                  onClick={handleEdit}
                  disabled={isProcessing || !prompt.trim()}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  {isProcessing ? 'Renderizando' : 'Renderizar'}
                </button>
              </div>
            </div>
          </div>

          {/* Side History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full min-h-[400px]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">Últimas Renderizações</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500 transition-all"
                    onClick={() => { setSource(item.original); setResult(item.result); setPrompt(item.prompt); setViewMode('slider'); }}
                  >
                    <img src={item.result.url} className="w-full aspect-video object-cover" alt="Histórico" />
                    <div className="p-3 bg-black/60 backdrop-blur-md">
                      <p className="text-[10px] text-zinc-400 line-clamp-1 italic">"{item.prompt}"</p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 grayscale">
                    <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
