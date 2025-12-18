
import React, { useRef } from 'react';
import { AppState } from '../types';
import { Database, Trash2, Share2, Download, Upload, Volume2, Crown, Smartphone } from 'lucide-react';
import { playArcadeSound } from '../audio';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  installPWA: () => void;
  canInstall: boolean;
}

const SettingsView: React.FC<Props> = ({ state, setState, installPWA, canInstall }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetData = () => {
    if (window.confirm("Isso apagará todos os dados. Tem certeza?")) {
      setState({ players: {}, queue: [], activeMatch: null, history: [] });
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
          <div className="bg-[#4ade80] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Database size={32} className="text-black" />
          </div>
          <h2 className="font-arcade text-xl text-white pt-2">Ajustes da Arena</h2>
      </div>

      {canInstall && (
        <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] p-5 rounded-3xl shadow-lg animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-4 text-black">
                <Smartphone size={32} />
                <div className="flex-1">
                    <h4 className="font-arcade text-sm">REI DA MESA NO CELULAR</h4>
                    <p className="text-[10px] font-bold opacity-80 uppercase">Instale para usar offline e em tela cheia!</p>
                </div>
                <button 
                  onClick={installPWA}
                  className="bg-black text-white px-4 py-2 rounded-xl font-arcade text-[10px] active:scale-90 transition-transform"
                >
                    INSTALAR
                </button>
            </div>
        </div>
      )}

      <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Controles</h3>
          <div className="grid gap-2">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'REI DA MESA', url: window.location.origin });
                  }
                }}
                className="w-full bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-zinc-800"
              >
                  <div className="flex items-center gap-3">
                      <Share2 className="text-[#4ade80]" size={20} />
                      <span className="font-bold">Convidar Amigos</span>
                  </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {
                    const data = JSON.stringify(state);
                    const blob = new Blob([data], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'reidamesa-backup.json';
                    a.click();
                  }} className="bg-zinc-900 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800">
                      <Download className="text-[#4ade80]" size={20} />
                      <span className="text-[10px] font-bold uppercase">Backup</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-900 p-4 rounded-2xl flex flex-col items-center gap-2 border border-zinc-800">
                      <Upload className="text-[#eab308]" size={20} />
                      <span className="text-[10px] font-bold uppercase">Restaurar</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                          try {
                              const json = JSON.parse(ev.target?.result as string);
                              setState(json);
                              alert("Sucesso!");
                          } catch { alert("Erro!"); }
                      };
                      reader.readAsText(file);
                  }} />
              </div>

              <button onClick={resetData} className="w-full bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-zinc-800 text-red-500">
                  <div className="flex items-center gap-3">
                      <Trash2 size={20} />
                      <span className="font-bold">Limpar Tudo</span>
                  </div>
              </button>
          </div>
      </div>

      <div className="text-center text-[10px] text-zinc-600 font-arcade opacity-30 pt-4">
          REI DA MESA V1.1 • ARCADE ENGINE
      </div>
    </div>
  );
};

export default SettingsView;
