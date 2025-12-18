
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Match, GameMode } from '../types';
import { 
  Plus, Minus, Crown, Zap, RefreshCw, XCircle, 
  RotateCw, ArrowLeftRight, SkipForward, Flame, Maximize, Settings, ChevronDown
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
  const [isLandscape, setIsLandscape] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (activeMatch && activeMatch.scoreA === 0 && activeMatch.scoreB === 0) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeMatch?.id]);

  const currentStreak = useMemo(() => {
    if (!activeMatch) return 0;
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
  const isSpecialVictory = isPneuA || isPneuB || activeMatch.isComeback;

  if (showIntro) {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
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
      <div className={`flex-1 flex ${isLandscape ? 'flex-row items-center justify-center px-8 gap-8' : 'flex-col items-center justify-between px-2'} transition-all duration-500 relative z-10 ${winner === side ? 'bg-[#4ade8015]' : ''}`}>
          
          {/* Jogador/Nome - Agora mais baixo (pt-32 no vertical, flex-col no horizontal) */}
          <div className={`${isLandscape ? 'w-1/4 flex flex-col items-center order-1' : 'pt-32 flex flex-col items-center space-y-2'}`}>
              <div className={`${isLandscape ? 'text-6xl' : 'text-4xl'} drop-shadow-md`}>{team.map((p: any) => p.emoji).join('')}</div>
              <div className="flex flex-col items-center mt-2">
                  <h3 className="font-arcade text-[10px] text-center text-white/60 truncate max-w-[120px] uppercase tracking-tighter">
                      {team.map((p: any) => p.name.split(' ')[0]).join(' & ')}
                  </h3>
                  
                  {isKingSide && currentStreak > 0 && (
                    <div className={`mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 border border-white/5 ${legendaryFire ? 'animate-shake' : ''}`}>
                        <div className={`relative ${intenseFire ? 'animate-flame' : ''}`}>
                            <Flame 
                                size={intenseFire ? 14 : 10} 
                                className={intenseFire ? 'text-orange-500' : 'text-yellow-500'} 
                                fill="currentColor" 
                            />
                        </div>
                        <span className="font-arcade text-[7px] text-white">{currentStreak}V</span>
                    </div>
                  )}
              </div>
          </div>
          
          {/* Pontuação - No centro e gigante */}
          <div className={`font-arcade transition-all select-none pointer-events-none ${isLandscape ? 'text-[35vh] leading-none order-2' : 'text-[24vh] leading-[0.7] -mt-6'} ${winner === side ? 'text-[#4ade80] scale-105 drop-shadow-[0_0_40px_rgba(74,222,128,0.4)]' : 'text-zinc-100 opacity-90'}`}>
              {score}
          </div>
          
          {/* Botões de Ação */}
          <div className={`${isLandscape ? 'w-1/4 flex flex-col gap-3 order-3' : 'w-full flex flex-col p-4 pb-12 space-y-3'}`}>
              <button 
                onClick={() => updateScore(side, 1)} 
                disabled={!!activeMatch.winner} 
                className={`w-full ${isLandscape ? 'h-32' : 'h-24'} text-black rounded-[2rem] shadow-xl flex items-center justify-center active:scale-95 disabled:opacity-50 transition-all ${isKingSide ? 'bg-[#4ade80]' : 'bg-white'}`}
              >
                <Plus size={isLandscape ? 52 : 40} strokeWidth={3} />
              </button>
              <button 
                onClick={() => updateScore(side, -1)} 
                disabled={!!activeMatch.winner} 
                className="w-full py-3 bg-red-600/80 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
          </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 flex flex-col bg-[#0a0a0a] overflow-hidden transition-all duration-500 ${isRotated ? 'rotated-ui' : ''} ${isLandscape ? 'landscape-mode' : ''}`}>
      
      {/* HUD SUPERIOR - Inteligente */}
      <div className={`absolute top-0 left-0 right-0 z-[110] flex items-center justify-between p-4 transition-all ${isLandscape ? (showControls ? 'bg-black/90 translate-y-0' : 'bg-transparent -translate-y-2 opacity-0 pointer-events-none') : 'bg-black/40 backdrop-blur-md border-b border-white/5'}`}>
          <div className="flex gap-2">
            <button onClick={resetMatch} className="p-3 bg-zinc-900/90 rounded-2xl text-zinc-500 border border-white/5 active:scale-90"><XCircle size={20} /></button>
            <button onClick={() => setIsSwapped(!isSwapped)} className="p-3 bg-zinc-900/90 rounded-2xl text-[#4ade80] border border-white/5 active:scale-90"><ArrowLeftRight size={20} /></button>
            <button onClick={() => setIsRotated(!isRotated)} className="p-3 bg-zinc-900/90 rounded-2xl text-[#eab308] border border-white/5 active:scale-90"><RotateCw size={20} /></button>
          </div>

          <div className="flex-1 flex justify-center px-4">
              <div className="bg-zinc-900/90 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="font-arcade text-[9px] text-zinc-300 tracking-tighter uppercase">{activeMatch.mode}</span>
                  </div>
              </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setIsLandscape(!isLandscape)} className="p-3 bg-zinc-900/90 rounded-2xl text-blue-400 border border-white/5 active:scale-90">
                <Maximize size={20} />
            </button>
            <button onClick={() => window.confirm("Zerar placar?") && (updateScore('A', -activeMatch.scoreA), updateScore('B', -activeMatch.scoreB))} className="p-3 bg-zinc-900/90 rounded-2xl text-zinc-500 border border-white/5 active:scale-90">
                <RefreshCw size={20} />
            </button>
          </div>
      </div>

      {/* BOTÃO ENGRENAGEM (Apenas modo landscape) */}
      {isLandscape && (
          <button 
            onClick={() => setShowControls(!showControls)}
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-[120] p-3 bg-white/5 rounded-full text-white/20 hover:text-white transition-all active:scale-90 ${showControls ? 'rotate-90 text-[#4ade80]' : ''}`}
          >
            {showControls ? <ChevronDown size={24} /> : <Settings size={24} />}
          </button>
      )}

      {/* ÁREA DE JOGO */}
      <div className={`relative flex-1 flex h-full ${isLandscape ? 'flex-col' : 'flex-row'} px-2`}>
        {/* Rede Central (Dinâmica) */}
        <div className={`absolute z-0 bg-white/5 ${isLandscape ? 'inset-x-0 top-1/2 -translate-y-1/2 h-[2px] flex flex-row justify-around px-32' : 'inset-y-0 left-1/2 -translate-x-1/2 w-[2px] flex flex-col justify-around py-48'}`}>
             {[...Array(15)].map((_, i) => <div key={i} className={`rounded-full bg-white/20 ${isLandscape ? 'w-1 h-1' : 'w-1 h-1'}`}></div>)}
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

      {/* FINALIZAÇÃO DINÂMICA (Botão Centralizado abaixo de avisos) */}
      {activeMatch.winner && (
        <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500 p-8">
            
            <div className="flex flex-col items-center w-full max-w-lg">
                
                {/* Avisos Especiais */}
                {(isPneuA || isPneuB) && (
                    <div className="flex flex-col items-center mb-8 animate-king">
                        <div className="bg-red-600 text-white font-arcade text-7xl px-12 py-6 rounded-[2.5rem] shadow-2xl rotate-[-8deg] border-8 border-white/10">PNEU!</div>
                        <p className="font-arcade text-white text-lg mt-4 uppercase opacity-80">Atropelo Total!</p>
                    </div>
                )}

                {activeMatch.isComeback && !(isPneuA || isPneuB) && (
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-blue-600 text-white font-arcade text-5xl px-8 py-4 rounded-3xl shadow-2xl animate-shake border-4 border-white/20">VIRADA ÉPICA!</div>
                        <div className="flex gap-4 mt-4">
                            <Zap size={32} className="text-yellow-400 animate-pulse" />
                            <Zap size={32} className="text-yellow-400 animate-pulse delay-75" />
                        </div>
                    </div>
                )}

                {/* Se não houver especial, mas houver vencedor, um título simples */}
                {!isSpecialVictory && (
                    <div className="mb-12 flex flex-col items-center">
                        <Crown size={64} className="text-yellow-500 mb-2 animate-bounce" />
                        <h2 className="font-arcade text-3xl text-white">TEMOS UM REI!</h2>
                    </div>
                )}

                {/* Botões de Ação Centralizados */}
                <div className="flex flex-col items-center gap-4 pointer-events-auto w-full">
                    <button 
                        onClick={() => finishMatch(true)} 
                        className="w-full max-w-sm bg-[#4ade80] text-black px-8 py-6 rounded-[2.5rem] font-arcade text-xl shadow-[0_0_50px_rgba(74,222,128,0.5)] flex items-center justify-center gap-4 animate-king border-4 border-white/20 active:scale-95"
                    >
                        <SkipForward size={32} /> PRÓXIMA PARTIDA
                    </button>
                    <button 
                        onClick={() => finishMatch(false)} 
                        className="bg-zinc-800/90 backdrop-blur-md text-white/70 px-8 py-3 rounded-2xl font-arcade text-[10px] hover:text-white transition-all active:scale-95"
                    >
                        SALVAR E REVISAR MESA
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
