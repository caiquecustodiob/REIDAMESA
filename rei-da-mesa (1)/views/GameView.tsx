
import React, { useState, useEffect } from 'react';
import { AppState, Match, GameMode } from '../types';
import { Plus, Minus, Crown, Zap, RefreshCw, Play } from 'lucide-react';

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

        {queue.length > 0 && (
          <div className="mt-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full max-w-xs">
            <h3 className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Próximos na Fila</h3>
            <div className="flex -space-x-2 justify-center">
              {queue.slice(0, 5).map(pid => (
                <div key={pid} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xl shadow-lg">
                  {players[pid]?.emoji}
                </div>
              ))}
              {queue.length > 5 && (
                <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold shadow-lg">
                  +{queue.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const pA = activeMatch.sideA.map(id => players[id]);
  const pB = activeMatch.sideB.map(id => players[id]);

  if (showIntro) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="font-arcade text-4xl mb-4 text-[#4ade80] animate-pulse">NOVO COMBATE!</div>
            <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-6xl mb-2">{pA[0].emoji}</span>
                    <span className="font-arcade text-xl">{pA[0].name}</span>
                </div>
                <div className="font-arcade text-5xl text-red-500">VS</div>
                <div className="flex flex-col items-center">
                    <span className="text-6xl mb-2">{pB[0].emoji}</span>
                    <span className="font-arcade text-xl">{pB[0].name}</span>
                </div>
            </div>
            <div className="text-zinc-500 font-arcade">“Rei da Mesa não se escolhe. Se aguenta.”</div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Table Top View Representation */}
      <div className="relative flex-1 flex flex-col p-4">
        {/* Net / Separator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-full h-1 bg-white"></div>
        </div>

        {/* Side A */}
        <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl mb-2 transition-all duration-300 border-2 ${activeMatch.winner === 'A' ? 'bg-[#4ade8022] border-[#4ade80] glow-green' : 'bg-zinc-900/40 border-transparent'}`}>
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                {players[activeMatch.sideA[0]].stats.consecutiveWins > 0 && (
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                     <Crown size={24} />
                   </div>
                )}
                <div className="text-5xl mb-2">{pA.map(p => p.emoji).join(' ')}</div>
              </div>
              <h3 className="font-arcade text-lg leading-tight text-center">
                {pA.map(p => p.name).join(' & ')}
              </h3>
              {players[activeMatch.sideA[0]].stats.consecutiveWins > 0 && (
                <span className="text-[10px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full mt-1">
                    🔥 {players[activeMatch.sideA[0]].stats.consecutiveWins} VITÓRIAS
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => updateScore('A', -1)} 
                  className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 active:scale-90"
                >
                    <Minus size={20} />
                </button>
                <div className={`font-arcade text-8xl transition-all ${activeMatch.winner === 'A' ? 'text-[#4ade80] scale-110' : 'text-white'}`}>
                    {activeMatch.scoreA}
                </div>
                <button 
                  onClick={() => updateScore('A', 1)} 
                  className="w-16 h-16 rounded-full bg-[#4ade80] flex items-center justify-center text-black shadow-lg border-2 border-white/20 active:scale-90"
                >
                    <Plus size={32} />
                </button>
            </div>
        </div>

        {/* Side B */}
        <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 border-2 ${activeMatch.winner === 'B' ? 'bg-[#4ade8022] border-[#4ade80] glow-green' : 'bg-zinc-900/40 border-transparent'}`}>
            <div className="flex items-center gap-6">
                <button 
                   onClick={() => updateScore('B', -1)} 
                   className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 active:scale-90"
                >
                    <Minus size={20} />
                </button>
                <div className={`font-arcade text-8xl transition-all ${activeMatch.winner === 'B' ? 'text-[#4ade80] scale-110' : 'text-white'}`}>
                    {activeMatch.scoreB}
                </div>
                <button 
                  onClick={() => updateScore('B', 1)} 
                  className="w-16 h-16 rounded-full bg-[#4ade80] flex items-center justify-center text-black shadow-lg border-2 border-white/20 active:scale-90"
                >
                    <Plus size={32} />
                </button>
            </div>

            <div className="flex flex-col items-center mt-4">
              <h3 className="font-arcade text-lg leading-tight text-center mb-2">
                {pB.map(p => p.name).join(' & ')}
              </h3>
              <div className="text-5xl">{pB.map(p => p.emoji).join(' ')}</div>
            </div>
        </div>
      </div>

      <div className="p-4 bg-[#1a1a1a] flex gap-3 border-t border-zinc-800">
        <button 
          onClick={resetMatch}
          className="flex-1 bg-zinc-800 text-zinc-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-95"
        >
          <RefreshCw size={18} /> CANCELAR
        </button>
        {activeMatch.winner && (
          <button 
            onClick={finishMatch}
            className="flex-[2] bg-[#4ade80] text-black p-4 rounded-xl font-arcade text-lg shadow-lg flex items-center justify-center gap-2 animate-king"
          >
            FINALIZAR MESA <Play size={20} fill="currentColor" />
          </button>
        )}
      </div>

      {activeMatch.isDeuce && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-red-600 text-white font-arcade px-6 py-2 rounded-full shadow-2xl rotate-[-5deg]">
              🔥 DESEMPATE! 2 DE VANTAGEM
          </div>
      )}
    </div>
  );
};

export default GameView;
