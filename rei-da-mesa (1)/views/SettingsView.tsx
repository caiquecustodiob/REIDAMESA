
import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import { Database, Trash2, Share2, Download, Upload, Smartphone, BookOpen, X } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  installPWA: () => void;
  canInstall: boolean;
}

const SettingsView: React.FC<Props> = ({ state, setState, installPWA, canInstall }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManual, setShowManual] = useState(false);

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
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Guia & Backup</h3>
          <div className="grid gap-2">
              {/* Botão MANUAL */}
              <button 
                onClick={() => setShowManual(true)}
                className="w-full bg-[#4ade80] p-4 rounded-2xl flex items-center justify-between border border-[#4ade8033] text-black shadow-lg active:scale-[0.98] transition-all"
              >
                  <div className="flex items-center gap-3">
                      <BookOpen size={20} />
                      <span className="font-arcade text-xs">MANUAL DO JOGO</span>
                  </div>
                  <span className="text-[8px] font-bold bg-black/10 px-2 py-1 rounded-full uppercase">Como Jogar</span>
              </button>

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

      {/* MODAL DO MANUAL */}
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
                        <p>O Rei da Mesa não é apenas um placar; é o juiz supremo da sua resenha. O objetivo é vencer o maior número de partidas consecutivas e garantir que todos saibam quem manda na mesa. Cada ponto te eleva no ranking e cada "pneu" humilha a concorrência.</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">🏆 2. Regras de Pontuação</h3>
                        <ul className="space-y-2 list-disc pl-4">
                            <li><strong className="text-white">Vitória Rápida:</strong> O primeiro a marcar 5 pontos vence.</li>
                            <li><strong className="text-white">O PNEU (5x0):</strong> Se você vencer por 5 a 0, você aplicou um PNEU. É a vitória máxima!</li>
                            <li><strong className="text-white">O DESEMPATE (DEUCE):</strong> No empate em 4x4, entramos no Desempate Crítico. Você precisa de 2 pontos de vantagem. Se ficar 1x1 no desempate, o placar volta pro zero!</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">👥 3. Fila de Jogadores</h3>
                        <p>A ordem é simples: Quem ganha, continua na mesa. Quem perde, vai para o final da fila esperar sua próxima chance. O botão de embaralhar pode ser usado para criar novos destinos.</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">⚔️ 4. Formação de Duplas</h3>
                        <p>No Modo Solo (1x1), os dois primeiros se enfrentam. No Modo Duplas (2x2), os quatro primeiros formam os times (1º e 2º contra 3º e 4º).</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">📊 5. Estatísticas e Rivalidades</h3>
                        <p><strong className="text-white">NÊMESIS:</strong> Aquele jogador que vive te ganhando. Seu maior pesadelo.</p>
                        <p><strong className="text-white">FREGUÊS:</strong> Aquele que você "amassa" com frequência. Seu cliente fiel.</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">🥇 6. Ranking e Destaques</h3>
                        <p>O Ranking é calculado por vitórias e pneus. O <strong className="text-yellow-500">Rei da Semana</strong> é coroado com base no desempenho dos últimos 7 dias. Você pode baixar seus <strong className="text-white">Highlights</strong> para postar no grupo!</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-arcade text-[#4ade80] text-sm">📺 7. Arena Mode</h3>
                        <p>Ideal para deixar uma TV ligada perto da mesa. Ele rotaciona os cards dos jogadores e mostra o ranking atualizado em tempo real.</p>
                    </section>

                    <section className="space-y-3 pt-4 border-t border-zinc-800 text-center">
                        <p className="font-arcade text-[10px] text-[#4ade80] italic">"Na mesa, o rei não se discute, se desafia."</p>
                    </section>
                </div>
            </div>
        </div>
      )}

      <div className="text-center text-[10px] text-zinc-600 font-arcade opacity-30 pt-4">
          REI DA MESA V1.1 • ARCADE ENGINE
      </div>
    </div>
  );
};

export default SettingsView;
