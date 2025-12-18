
import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import { Database, Trash2, Share2, Download, Upload, Smartphone, BookOpen, X, FileJson, CheckCircle2 } from 'lucide-react';
import { playArcadeSound } from '../audio';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  installPWA: () => void;
  canInstall: boolean;
}

const SettingsView: React.FC<Props> = ({ state, setState, installPWA, canInstall }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManual, setShowManual] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const resetData = () => {
    if (window.confirm("Isso apagará todos os dados de jogadores e partidas. Tem certeza?")) {
      setState({ players: {}, queue: [], activeMatch: null, history: [] });
      playArcadeSound('remove');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.players && Array.isArray(json.queue)) {
          setState(json);
          setImportStatus('success');
          playArcadeSound('victory');
          setTimeout(() => setImportStatus('idle'), 3000);
        } else {
          throw new Error("Formato inválido");
        }
      } catch (err) {
        setImportStatus('error');
        alert("Erro ao importar: O arquivo não parece ser um backup válido do Rei da Mesa.");
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Modern File System Access API (Para browsers Chromium)
  const handleModernImport = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Backup Rei da Mesa (JSON)',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const file = await handle.getFile();
        processFile(file);
      } else {
        fileInputRef.current?.click();
      }
    } catch (e) {
      console.log('Seleção cancelada ou falhou');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reidamesa-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Controle de Dados</h3>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <FileJson className="text-[#4ade80]" size={20} />
                <span className="font-arcade text-[10px] text-zinc-400">Backups e Sincronização</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl border border-white/5 transition-all active:scale-95"
                  >
                      <Download className="text-[#4ade80]" size={24} />
                      <span className="text-[9px] font-arcade text-white">EXPORTAR</span>
                  </button>

                  <button 
                    onClick={handleModernImport}
                    className="flex flex-col items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl border border-white/5 transition-all active:scale-95 relative"
                  >
                      {importStatus === 'success' ? (
                          <CheckCircle2 className="text-[#4ade80] animate-bounce" size={24} />
                      ) : (
                          <Upload className="text-[#eab308]" size={24} />
                      )}
                      <span className="text-[9px] font-arcade text-white">
                        {importStatus === 'success' ? 'SUCESSO!' : 'IMPORTAR'}
                      </span>
                  </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileUpload} 
              />
          </div>

          <div className="grid gap-2">
              <button 
                onClick={() => setShowManual(true)}
                className="w-full bg-[#4ade80] p-4 rounded-2xl flex items-center justify-between border border-[#4ade8033] text-black shadow-lg active:scale-[0.98] transition-all"
              >
                  <div className="flex items-center gap-3">
                      <BookOpen size={20} />
                      <span className="font-arcade text-xs">MANUAL DO JOGO</span>
                  </div>
                  <span className="text-[8px] font-bold bg-black/10 px-2 py-1 rounded-full uppercase">Regras</span>
              </button>

              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'REI DA MESA', url: window.location.origin });
                  }
                }}
                className="w-full bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-zinc-800"
              >
                  <div className="flex items-center gap-3 text-zinc-300">
                      <Share2 className="text-[#4ade80]" size={20} />
                      <span className="font-bold">Convidar Amigos</span>
                  </div>
              </button>

              <button onClick={resetData} className="w-full bg-zinc-900/50 p-4 rounded-2xl flex items-center justify-between border border-red-900/30 text-red-500/70 hover:text-red-500 transition-colors">
                  <div className="flex items-center gap-3">
                      <Trash2 size={20} />
                      <span className="font-bold">Zerar Arena</span>
                  </div>
              </button>
          </div>
      </div>

      {showManual && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-[#4ade80]" />
                        <h2 className="font-arcade text-lg text-white">Manual do Rei</h2>
                    </div>
                    <button onClick={() => setShowManual(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 text-sm leading-relaxed text-zinc-300">
                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">👑 1. O Objetivo do Jogo</h3>
                        <p>O Rei da Mesa é o juiz supremo da sua resenha. O objetivo é vencer o maior número de partidas consecutivas. Quem ganha fica na mesa, quem perde vai para o final da fila.</p>
                    </section>

                    <section className="space-y-3 text-center py-4 border-t border-zinc-800">
                        <p className="font-arcade text-[10px] text-[#4ade80] italic">"Na mesa, o rei não se discute, se desafia."</p>
                    </section>
                </div>
            </div>
        </div>
      )}

      <div className="text-center text-[10px] text-zinc-600 font-arcade opacity-30 pt-4">
          REI DA MESA V1.5 • DATA ENGINE
      </div>
    </div>
  );
};

export default SettingsView;
