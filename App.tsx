
import React from 'react';
import { GfxStudio } from './components/GfxStudio';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar Exemplo - Você pode manter ou remover no seu site */}
      <header className="px-8 py-6 border-b border-zinc-900 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(168,85,247,0.4)]">Ø</div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">ØRYK</h1>
              <span className="text-[9px] font-bold text-zinc-600 tracking-[0.3em] uppercase">GFX Studio PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">API ACTIVE</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <GfxStudio />
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a855f7; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
