
import React, { useState, useEffect } from 'react';
import { AppState, Match, GameMode } from '../types';
import { Plus, Minus, Crown, Zap, RefreshCw, Play, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  state: AppState;
  updateScore: (side: 'A' | 'B', amount: number) => void;
  finishMatch: () => void;
  startMatch: (mode: GameMode) => void;
  resetMatch: () => void;
}

const GameView: React.FC<Props> = ({ state, updateScore, finishMatch, startMatch, resetMatch }) => {
  const { activeMatch, players, queue } = state;
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (activeMatch && activeMatch.scoreA === 0 && activeMatch.scoreB === 0) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeMatch?.id]);

  if (!activeMatch) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <div className="animate-bounce">
            <Crown size={64} className="text-yellow-500 mx-auto mb-4" />
        </div>
        <h2 className="font-arcade text-3xl text-white">Pronto para a Mesa?</h2>
        <p className="text-[#737373] max-w-xs">
          {queue.length < 2 
            ? "Adicione pelo menos 2 jogadores na fila para começar o combate." 
            : "A fila está organizada. Escolha o modo de jogo."}
        </p>
        
        <div className="flex flex-col w-full max-w-sm gap-4">
          <button 
            disabled={queue.length < 2}
            onClick={() => startMatch('SOLO')}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-arcade text-xl transition-all shadow-xl ${
                queue.length >= 2 ? 'bg-[#4ade80] text-black hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Zap /> MODO SOLO (1x1)
          </button>
          
          <button 
            disabled={queue.length < 4}
            onClick={() => startMatch('DUPLAS')}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-arcade text-xl transition-all shadow-xl ${
                queue.length >= 4 ? 'bg-[#eab308] text-black hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Crown /> MODO DUPLAS (2x2)
          </button>
        </div>

        <div className="mt-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800 max-w-xs text-[10px] text-zinc-500 space-y-2 text-left">
            <div className="flex items-center gap-2 text-[#4ade80] font-bold">
                <AlertTriangle size={12} /> REGRAS DA MESA
            </div>
            <p>• 5-0 é vitória imediata (Pneu).</p>
            <p>• Desempate: Precisa de 2 pontos seguidos.</p>
            <p>• 1-1 no desempate volta pro zero.</p>
        </div>
      </div>
    );
  }

  const pA = activeMatch.sideA.map(id => players[id]);
  const pB = activeMatch.sideB.map(id => players[id]);

  const isPneuA = activeMatch.winner === 'A' && activeMatch.scoreA === 5 && activeMatch.scoreB === 0;
  const isPneuB = activeMatch.winner === 'B' && activeMatch.scoreB === 5 && activeMatch.scoreA === 0;

  if (showIntro) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="font-arcade text-4xl mb-4 text-[#4ade80] animate-pulse uppercase tracking-tighter">Confronto Mortal!</div>
            <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-7xl mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">{pA.map(p => p.emoji).join('')}</span>
                    <span className="font-arcade text-2xl text-white">{pA.map(p => p.name).join(' & ')}</span>
                </div>
                <div className="font-arcade text-6xl text-red-500 animate-bounce">VS</div>
                <div className="flex flex-col items-center">
                    <span className="text-7xl mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">{pB.map(p => p.emoji).join('')}</span>
                    <span className="font-arcade text-2xl text-white">{pB.map(p => p.name).join(' & ')}</span>
                </div>
            </div>
            <div className="text-[#4ade80] font-arcade text-sm italic">“A MESA NÃO PERDOA ERROS.”</div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] overflow-hidden">
      
      {/* HUD SUPERIOR - CONTROL BAR */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 bg-gradient-to-b from-black/95 via-black/40 to-transparent">
          <button 
            onClick={resetMatch}
            className="p-2 bg-zinc-900/60 backdrop-blur rounded-full text-zinc-500 border border-white/5 active:bg-red-900/40 transition-colors"
          >
            <XCircle size={20} />
          </button>

          <div className="flex-1 flex justify-center px-2">
              {activeMatch.winner ? (
                  <button 
                    onClick={finishMatch}
                    className="bg-[#4ade80] text-black px-5 py-2 rounded-full font-arcade text-[10px] shadow-[0_0_15px_rgba(74,222,128,0.4)] flex items-center gap-2 animate-king"
                  >
                    CONFIRMAR VITÓRIA <Play size={10} fill="currentColor" />
                  </button>
              ) : (
                  <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeMatch.isDeuce ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`}></span>
                      <span className="font-arcade text-[8px] text-zinc-400 tracking-widest uppercase">
                          {activeMatch.isDeuce ? 'DESEMPATE CRÍTICO' : `${activeMatch.mode} • BATALHA`}
                      </span>
                  </div>
              )}
          </div>

          <button 
            onClick={() => {
                if(window.confirm("Reiniciar placar?")) {
                    updateScore('A', -activeMatch.scoreA);
                    updateScore('B', -activeMatch.scoreB);
                }
            }}
            className="p-2 bg-zinc-900/60 backdrop-blur rounded-full text-zinc-500 border border-white/5 active:bg-yellow-900/40 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
      </div>

      {/* ÁREA PRINCIPAL DO COMBATE */}
      <div className="relative flex-1 flex h-full">
        {/* Net */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/5 z-0 flex flex-col justify-around py-20 opacity-30">
             {[...Array(30)].map((_, i) => (
                 <div key={i} className="w-0.5 h-0.5 bg-white/40 rounded-full"></div>
             ))}
        </div>

        {/* LADO A (ESQUERDA) */}
        <div className={`flex-1 flex flex-col items-center justify-between transition-all duration-500 relative z-10 ${activeMatch.winner === 'A' ? 'bg-[#4ade801a]' : 'bg-transparent'}`}>
            <div className="pt-16 flex flex-col items-center space-y-1">
                <div className="relative">
                    {pA[0].stats.consecutiveWins > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 animate-king">
                            <Crown size={24} />
                        </div>
                    )}
                    <div className="text-5xl drop-shadow-md">{pA.map(p => p.emoji).join('')}</div>
                </div>
                <h3 className="font-arcade text-xs text-center text-white truncate max-w-[80px] uppercase">
                    {pA.map(p => p.name).join(' & ')}
                </h3>
            </div>
            
            <div className={`font-arcade text-[22vh] leading-none transition-all select-none pointer-events-none ${activeMatch.winner === 'A' ? 'text-[#4ade80] scale-110 drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]' : 'text-zinc-100 opacity-90'}`}>
                {activeMatch.scoreA}
            </div>

            <div className="w-full flex flex-col p-4 pb-6 space-y-3">
                <button 
                  onClick={() => updateScore('A', 1)} 
                  disabled={!!activeMatch.winner}
                  className="w-full h-32 bg-[#4ade80] text-black rounded-[2rem] shadow-xl flex items-center justify-center active:scale-95 transition-transform group disabled:opacity-50"
                >
                    <Plus size={50} className="group-active:scale-125 transition-transform" />
                </button>
                <button 
                  onClick={() => updateScore('A', -1)} 
                  disabled={!!activeMatch.winner}
                  className="w-full py-3 bg-zinc-900/60 backdrop-blur text-zinc-700 rounded-2xl border border-zinc-800 flex items-center justify-center active:scale-95 disabled:opacity-50"
                >
                    <Minus size={20} />
                </button>
            </div>
        </div>

        {/* LADO B (DIREITA) */}
        <div className={`flex-1 flex flex-col items-center justify-between transition-all duration-500 relative z-10 ${activeMatch.winner === 'B' ? 'bg-[#4ade801a]' : 'bg-transparent'}`}>
            <div className="pt-16 flex flex-col items-center space-y-1">
                <div className="relative">
                    {pB[0].stats.consecutiveWins > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 animate-king">
                            <Crown size={24} />
                        </div>
                    )}
                    <div className="text-5xl drop-shadow-md">{pB.map(p => p.emoji).join('')}</div>
                </div>
                <h3 className="font-arcade text-xs text-center text-white truncate max-w-[80px] uppercase">
                    {pB.map(p => p.name).join(' & ')}
                </h3>
            </div>

            <div className={`font-arcade text-[22vh] leading-none transition-all select-none pointer-events-none ${activeMatch.winner === 'B' ? 'text-[#4ade80] scale-110 drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]' : 'text-zinc-100 opacity-90'}`}>
                {activeMatch.scoreB}
            </div>

            <div className="w-full flex flex-col p-4 pb-6 space-y-3">
                <button 
                  onClick={() => updateScore('B', 1)} 
                  disabled={!!activeMatch.winner}
                  className="w-full h-32 bg-[#4ade80] text-black rounded-[2rem] shadow-xl flex items-center justify-center active:scale-95 transition-transform group disabled:opacity-50"
                >
                    <Plus size={50} className="group-active:scale-125 transition-transform" />
                </button>
                <button 
                  onClick={() => updateScore('B', -1)} 
                  disabled={!!activeMatch.winner}
                  className="w-full py-3 bg-zinc-900/60 backdrop-blur text-zinc-700 rounded-2xl border border-zinc-800 flex items-center justify-center active:scale-95 disabled:opacity-50"
                >
                    <Minus size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* OVERLAYS DE EVENTOS ESPECIAIS */}
      {activeMatch.isDeuce && !activeMatch.winner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-orange-600 text-white font-arcade px-6 py-3 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.7)] rotate-[-2deg] animate-bounce text-xs flex flex-col items-center">
              <span>🔥 OVERTIME</span>
              <span className="text-[8px] opacity-80 mt-1">GANHE 2 SEGUIDAS</span>
          </div>
      )}

      {(isPneuA || isPneuB) && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
              <div className="bg-red-600 text-white font-arcade text-6xl px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.8)] rotate-[-10deg] animate-king">
                  PNEU!
              </div>
              <div className="font-arcade text-white text-xl mt-6 uppercase tracking-tighter">Vitória Humilhante</div>
          </div>
      )}

      {/* Side Streaks */}
      <div className="absolute top-48 w-full flex justify-between px-2 pointer-events-none">
          <div className="flex flex-col gap-1">
             {pA[0].stats.consecutiveWins > 0 && [...Array(Math.min(pA[0].stats.consecutiveWins, 5))].map((_, i) => (
                 <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-sm"></div>
             ))}
          </div>
          <div className="flex flex-col gap-1 items-end">
             {pB[0].stats.consecutiveWins > 0 && [...Array(Math.min(pB[0].stats.consecutiveWins, 5))].map((_, i) => (
                 <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-sm"></div>
             ))}
          </div>
      </div>
    </div>
  );
};

export default GameView;
