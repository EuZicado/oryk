
import React, { useState, useEffect } from 'react';
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
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const { isProcessing, error, renderGfx } = useGfxEngine();

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } catch (e) {
      setHasApiKey(false);
    }
  };

  const handleConnect = async () => {
    await (window as any).aistudio.openSelectKey();
    // Após abrir o seletor, assumimos que o usuário tentará prosseguir
    setHasApiKey(true);
  };

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
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
    }
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

  // Tela de Bloqueio se não houver chave
  if (hasApiKey === false) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-4xl font-black tracking-tight uppercase">Desbloquear ØRYK PRO</h2>
          <p className="text-zinc-500 font-medium leading-relaxed">
            Para gerar GFX profissionais sem limites de cota, você precisa conectar sua própria chave de API do Google Gemini.
          </p>
          <div className="pt-4 space-y-3">
            <button 
              onClick={handleConnect}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              Conectar Gemini API
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
            >
              Saiba mais sobre faturamento e cotas
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {!source ? (
        <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Transforme seu <br/> <span className="text-purple-500">Roblox GFX</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">
              Suba um screenshot e descreva sua visão. O modelo Gemini 3 Pro cuida do resto.
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
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white p-4 rounded-xl text-xs font-bold backdrop-blur-md shadow-2xl border border-red-400/20">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{error}</span>
                  </div>
                  {error.includes("Cota") && (
                    <button onClick={handleConnect} className="mt-2 text-[9px] uppercase tracking-widest underline opacity-80 hover:opacity-100">Trocar Chave de API</button>
                  )}
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Histórico</h3>
                <span className="text-[8px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">GEMINI 3 PRO</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500 transition-all"
                    onClick={() => { setSource(item.original); setResult(item.result); setPrompt(item.prompt); setViewMode('slider'); }}
                  >
                    <img src={item.result.url} className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Histórico" />
                    <div className="p-3 bg-black/60 backdrop-blur-md border-t border-zinc-800/50">
                      <p className="text-[10px] text-zinc-400 line-clamp-1 italic">"{item.prompt}"</p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale space-y-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum Projeto</p>
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
