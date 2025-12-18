
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Match, GameMode } from '../types';
import { 
  Plus, Minus, Crown, Zap, RefreshCw, XCircle, 
  RotateCw, ArrowLeftRight, SkipForward, Flame
} from 'lucide-react';

interface Props {
  state: AppState;
  updateScore: (side: 'A' | 'B', amount: number) => void;
  finishMatch: (autoNext?: boolean) => void;
  startMatch: (mode: GameMode) => void;
  resetMatch: () => void;
}

const GameView: React.FC<Props> = ({ state, updateScore, finishMatch, startMatch, resetMatch }) => {
  const { activeMatch, players, queue } = state;
  const [showIntro, setShowIntro] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    if (activeMatch && activeMatch.scoreA === 0 && activeMatch.scoreB === 0) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeMatch?.id]);

  // Calcular sequência atual (Lado A costuma ser o vencedor anterior)
  const currentStreak = useMemo(() => {
    if (!activeMatch) return 0;
    // Pega a menor sequência entre os jogadores do Lado A
    const streaks = activeMatch.sideA.map(id => players[id]?.stats.consecutiveWins || 0);
    return Math.min(...streaks);
  }, [activeMatch, players]);

  if (!activeMatch) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <div className="animate-bounce">
            <Crown size={64} className="text-yellow-500 mx-auto mb-4" />
        </div>
        <h2 className="font-arcade text-3xl text-white">Nova Batalha?</h2>
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
            <div className="font-arcade text-4xl mb-4 text-[#4ade80] animate-pulse uppercase tracking-tighter">Preparar para Jogar!</div>
            <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-7xl mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">{pA.map(p => p.emoji).join('')}</span>
                    <span className="font-arcade text-xl text-white">{pA.map(p => p.name.split(' ')[0]).join(' & ')}</span>
                </div>
                <div className="font-arcade text-5xl text-red-500">VS</div>
                <div className="flex flex-col items-center">
                    <span className="text-7xl mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">{pB.map(p => p.emoji).join('')}</span>
                    <span className="font-arcade text-xl text-white">{pB.map(p => p.name.split(' ')[0]).join(' & ')}</span>
                </div>
            </div>
        </div>
    );
  }

  const TeamSide = ({ side, team, score, winner }: any) => {
    const isKingSide = side === 'A';
    const showFire = isKingSide && currentStreak >= 3;
    const intenseFire = isKingSide && currentStreak >= 5;
    const legendaryFire = isKingSide && currentStreak >= 10;

    return (
      <div className={`flex-1 flex flex-col items-center justify-between transition-all duration-500 relative z-10 ${winner === side ? 'bg-[#4ade8015]' : ''}`}>
          
          <div className="pt-16 flex flex-col items-center space-y-2">
              <div className="text-5xl drop-shadow-md">{team.map((p: any) => p.emoji).join('')}</div>
              <div className="flex flex-col items-center">
                  <h3 className="font-arcade text-[10px] text-center text-white truncate max-w-[120px] uppercase">
                      {team.map((p: any) => p.name.split(' ')[0]).join(' & ')}
                  </h3>
                  
                  {/* Contador ON FIRE - Agora abaixo do nome */}
                  {isKingSide && currentStreak > 0 && (
                    <div className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 ${legendaryFire ? 'animate-shake' : ''}`}>
                        <div className={`relative ${intenseFire ? 'animate-flame' : ''}`}>
                            <Flame 
                                size={intenseFire ? 16 : 12} 
                                className={intenseFire ? 'text-orange-500' : 'text-yellow-500'} 
                                fill="currentColor" 
                            />
                            {legendaryFire && <div className="absolute inset-0 bg-orange-600 blur-md opacity-40"></div>}
                        </div>
                        <span className="font-arcade text-[8px] text-white whitespace-nowrap">{currentStreak} VITÓRIAS</span>
                    </div>
                  )}
              </div>
          </div>
          
          <div className={`font-arcade text-[18vh] leading-none transition-all select-none pointer-events-none ${winner === side ? 'text-[#4ade80] scale-110 drop-shadow-[0_0_30px_rgba(74,222,128,0.4)]' : 'text-zinc-100 opacity-90'}`}>
              {score}
          </div>
          
          <div className="w-full flex flex-col p-4 pb-12 space-y-3">
              <button 
                onClick={() => updateScore(side, 1)} 
                disabled={!!activeMatch.winner} 
                className={`w-full h-28 text-black rounded-[2.5rem] shadow-xl flex items-center justify-center active:scale-95 disabled:opacity-50 transition-all ${isKingSide ? 'bg-[#4ade80]' : 'bg-white'}`}
              >
                <Plus size={44} strokeWidth={3} />
              </button>
              <button 
                onClick={() => updateScore(side, -1)} 
                disabled={!!activeMatch.winner} 
                className="w-full py-4 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
          </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 flex flex-col bg-[#0a0a0a] overflow-hidden transition-transform duration-500 ${isRotated ? 'rotated-ui' : ''}`}>
      
      {/* HUD SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm border-b border-white/5">
          <div className="flex gap-2">
            <button onClick={resetMatch} className="p-3 bg-zinc-900/90 rounded-2xl text-zinc-500 border border-white/5 active:scale-90"><XCircle size={20} /></button>
            <button onClick={() => setIsSwapped(!isSwapped)} className="p-3 bg-zinc-900/90 rounded-2xl text-[#4ade80] border border-white/5 active:scale-90"><ArrowLeftRight size={20} /></button>
            <button onClick={() => setIsRotated(!isRotated)} className="p-3 bg-zinc-900/90 rounded-2xl text-[#eab308] border border-white/5 active:scale-90"><RotateCw size={20} /></button>
          </div>

          <div className="flex-1 flex justify-center px-4">
              {activeMatch.winner ? (
                  <div className="flex gap-2 animate-in zoom-in duration-300">
                    <button onClick={() => finishMatch(false)} className="bg-zinc-800 text-white px-5 py-2.5 rounded-2xl font-arcade text-[8px] flex items-center gap-2 border border-zinc-700">SALVAR</button>
                    <button onClick={() => finishMatch(true)} className="bg-[#4ade80] text-black px-6 py-2.5 rounded-2xl font-arcade text-[10px] shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center gap-2 animate-king">
                        <SkipForward size={14} /> PRÓXIMA PARTIDA
                    </button>
                  </div>
              ) : (
                  <div className="bg-zinc-900/90 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="font-arcade text-[9px] text-zinc-300 tracking-tighter uppercase">{activeMatch.mode}</span>
                      </div>
                      <div className="w-[1px] h-4 bg-zinc-800"></div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Arena Ativa</div>
                  </div>
              )}
          </div>

          <button onClick={() => window.confirm("Zerar placar?") && (updateScore('A', -activeMatch.scoreA), updateScore('B', -activeMatch.scoreB))} className="p-3 bg-zinc-900/90 rounded-2xl text-zinc-500 border border-white/5 active:scale-90"><RefreshCw size={20} /></button>
      </div>

      {/* ÁREA DE JOGO */}
      <div className="relative flex-1 flex h-full">
        {/* Rede Central */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 z-0 flex flex-col justify-around py-20">
             {[...Array(25)].map((_, i) => <div key={i} className="w-1 h-1 bg-white/40 rounded-full"></div>)}
        </div>

        {isSwapped ? (
          <> 
            <TeamSide side="B" team={pB} score={activeMatch.scoreB} winner={activeMatch.winner} /> 
            <TeamSide side="A" team={pA} score={activeMatch.scoreA} winner={activeMatch.winner} /> 
          </>
        ) : (
          <> 
            <TeamSide side="A" team={pA} score={activeMatch.scoreA} winner={activeMatch.winner} /> 
            <TeamSide side="B" team={pB} score={activeMatch.scoreB} winner={activeMatch.winner} /> 
          </>
        )}
      </div>

      {/* Overlay de Vitória Máxima (Pneu) */}
      {(isPneuA || isPneuB) && (
          <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-500">
              <div className="bg-red-600 text-white font-arcade text-7xl px-16 py-8 rounded-[3rem] shadow-2xl rotate-[-12deg] animate-king border-8 border-white/10">PNEU!</div>
              <p className="font-arcade text-white text-xl mt-12 tracking-tighter opacity-80 uppercase">A Mesa Foi Atropelada!</p>
          </div>
      )}

      {/* Overlay de Virada Épica */}
      {activeMatch.winner && activeMatch.isComeback && (
          <div className="absolute inset-0 z-30 bg-blue-600/20 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none animate-in zoom-in duration-500">
              <div className="bg-white text-blue-600 font-arcade text-5xl px-10 py-5 rounded-2xl shadow-2xl animate-shake">VIRADA ÉPICA!</div>
              <div className="flex gap-4 mt-6">
                <Zap size={40} className="text-yellow-400 animate-pulse" />
                <Zap size={40} className="text-yellow-400 animate-pulse delay-75" />
                <Zap size={40} className="text-yellow-400 animate-pulse delay-150" />
              </div>
          </div>
      )}
    </div>
  );
};

export default GameView;
