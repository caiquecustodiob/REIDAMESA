
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Player } from '../types';
import { X, Crown, Zap, Flame, Target, User, Users, Heart, Skull, Ghost, Smile, Award, Download, Video, Loader2, Play } from 'lucide-react';
import { playArcadeSound } from '../audio';

interface Props {
  playerId: string;
  state: AppState;
  onClose: () => void;
}

const SCREENS_COUNT = 7;
const SCREEN_DURATION = 2500;
const TOTAL_DURATION = SCREENS_COUNT * SCREEN_DURATION;
const FPS = 30;

const HighlightsOverlay: React.FC<Props> = ({ playerId, state, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [renderReady, setRenderReady] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  const player = state.players[playerId];
  
  const stats = useMemo(() => {
    const p = player;
    const winRate = p.stats.matches > 0 ? Math.round((p.stats.wins / p.stats.matches) * 100) : 0;
    
    let nemesisId = '';
    let clientId = '';
    let maxNemesisLosses = 0;
    let maxClientWins = 0;
    Object.entries(p.rivalries).forEach(([rid, s]: any) => {
      if (s.lossesTo > maxNemesisLosses) { maxNemesisLosses = s.lossesTo; nemesisId = rid; }
      if (s.winsAgainst > maxClientWins) { maxClientWins = s.winsAgainst; clientId = rid; }
    });

    let bestFriendId = '';
    let badVibeId = '';
    let maxPartnerWins = -1;
    let maxPartnerLosses = -1;
    if (p.partnerships) {
      Object.entries(p.partnerships).forEach(([pid, s]: any) => {
        if (s.wins > maxPartnerWins) { maxPartnerWins = s.wins; bestFriendId = pid; }
        if (s.losses > maxPartnerLosses) { maxPartnerLosses = s.losses; badVibeId = pid; }
      });
    }

    return {
      winRate,
      nemesis: state.players[nemesisId],
      client: state.players[clientId],
      bestFriend: state.players[bestFriendId],
      badVibe: state.players[badVibeId]
    };
  }, [player, state.players]);

  // Loop de Animação Visual Normal (UI)
  useEffect(() => {
    if (isRecording) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const currentIdx = Math.floor(elapsed / SCREEN_DURATION);
      const currentProg = (elapsed % SCREEN_DURATION) / SCREEN_DURATION * 100;

      if (currentIdx >= SCREENS_COUNT) {
        onClose();
        clearInterval(interval);
      } else {
        if (currentIdx !== currentScreen) {
           setCurrentScreen(currentIdx);
           playArcadeSound('point'); // Som de ponto na transição
        }
        setProgress(currentProg);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [currentScreen, onClose, isRecording]);

  // Desenho Complexo no Canvas para o Vídeo
  const drawCanvasFrame = (ctx: CanvasRenderingContext2D, screen: number, prog: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const centerX = w / 2;

    // 1. Limpar e Fundo
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // 2. Brilho de Fundo (Vignette)
    const grad = ctx.createRadialGradient(centerX, h / 2, 0, centerX, h / 2, h * 0.8);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. Barras de Progresso Superiores
    const barW = (w - 100) / SCREENS_COUNT;
    for (let i = 0; i < SCREENS_COUNT; i++) {
        ctx.fillStyle = i < screen ? '#4ade80' : i === screen ? '#4ade8055' : '#ffffff22';
        ctx.fillRect(50 + (i * barW) + 2, 60, barW - 4, 8);
        if (i === screen) {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(50 + (i * barW) + 2, 60, (barW - 4) * (prog / 100), 8);
        }
    }

    // 4. Header
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`${player.emoji} ${player.name.toUpperCase()}`, 60, 120);
    ctx.font = '700 20px Inter';
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'right';
    ctx.fillText("REI DA MESA ANALYTICS", w - 60, 120);

    // 5. Conteúdo por Tela
    ctx.textAlign = 'center';
    
    if (screen === 0) { // INTRO
        ctx.font = '900 180px Inter';
        ctx.fillText(player.emoji, centerX, h / 2 - 100);
        ctx.font = '900 80px Inter';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(player.name, centerX, h / 2 + 50);
        ctx.font = '900 40px Inter';
        ctx.fillStyle = '#4ade80';
        ctx.fillText("HOJE TEVE AULA!", centerX, h / 2 + 150);
    } 
    else if (screen === 1) { // GERAL
        ctx.font = '900 40px Inter'; ctx.fillStyle = '#737373';
        ctx.fillText("RESUMO DA ARENA", centerX, 300);
        
        drawStatBox(ctx, "GAMES", player.stats.matches, centerX - 160, 500, '#ffffff');
        drawStatBox(ctx, "WINS", player.stats.wins, centerX + 160, 500, '#4ade80');
        drawStatBox(ctx, "WR%", `${stats.winRate}%`, centerX - 160, 700, '#60a5fa');
        drawStatBox(ctx, "STREAK", player.stats.maxConsecutiveWins, centerX + 160, 700, '#fb923c');
    }
    else if (screen === 2) { // SOLO X DUPLA
        ctx.font = '900 40px Inter'; ctx.fillStyle = '#737373';
        ctx.fillText("ESTILO DE JOGO", centerX, 300);
        
        const soloH = (player.stats.soloMatches / (player.stats.matches || 1)) * 400;
        const duplaH = (player.stats.duplasMatches / (player.stats.matches || 1)) * 400;

        ctx.fillStyle = '#3b82f6'; ctx.fillRect(centerX - 150, 800 - soloH, 100, soloH);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(centerX + 50, 800 - duplaH, 100, duplaH);
        
        ctx.font = '700 25px Inter'; ctx.fillStyle = '#ffffff';
        ctx.fillText("SOLO", centerX - 100, 850);
        ctx.fillText("DUPLA", centerX + 100, 850);
        
        ctx.font = '900 50px Inter';
        ctx.fillText(player.stats.soloMatches > player.stats.duplasMatches ? "LOBO SOLITÁRIO 🐺" : "TEAM PLAYER 🤝", centerX, 950);
    }
    else if (screen === 3) { // QUÍMICA
        ctx.font = '900 40px Inter'; ctx.fillStyle = '#737373';
        ctx.fillText("PARCERIAS", centerX, 300);
        drawAffinity(ctx, "SINTONIA FINA", stats.bestFriend, centerX, 550, '#ec4899');
        drawAffinity(ctx, "FORA DE RITMO", stats.badVibe, centerX, 800, '#737373');
    }
    else if (screen === 4) { // PNEUS
        ctx.font = '900 40px Inter'; ctx.fillStyle = '#737373';
        ctx.fillText("PNEUS & DOMÍNIO", centerX, 300);
        drawStatBox(ctx, "APLICADOS", player.stats.pneusApplied, centerX - 160, 600, '#4ade80');
        drawStatBox(ctx, "SOFRIDOS", player.stats.pneusReceived, centerX + 160, 600, '#ef4444');
        if (player.stats.pneusApplied > 0) {
            ctx.font = '900 60px Inter'; ctx.fillStyle = '#4ade80';
            ctx.fillText("TRATORISTA! 🚜", centerX, 850);
        }
    }
    else if (screen === 5) { // RIVALIDADES
        ctx.font = '900 40px Inter'; ctx.fillStyle = '#737373';
        ctx.fillText("RIVALIDADES", centerX, 300);
        drawAffinity(ctx, "CARRASCO", stats.nemesis, centerX, 550, '#ef4444');
        drawAffinity(ctx, "FREGUÊS", stats.client, centerX, 800, '#22c55e');
    }
    else if (screen === 6) { // CLOSURE
        ctx.font = '900 150px Inter'; ctx.fillStyle = '#eab308';
        ctx.fillText("👑", centerX, h / 2 - 150);
        ctx.font = '900 100px Inter'; ctx.fillStyle = '#ffffff';
        ctx.fillText(player.emoji, centerX, h / 2 - 50);
        ctx.font = '900 70px Inter';
        ctx.fillText(player.name, centerX, h / 2 + 80);
        ctx.font = '900 30px Inter'; ctx.fillStyle = '#eab308';
        ctx.fillText("REI DA MESA", centerX, h / 2 + 180);
    }
  };

  const drawStatBox = (ctx: any, label: string, val: any, x: number, y: number, color: string) => {
      ctx.fillStyle = '#111'; ctx.fillRect(x - 120, y - 80, 240, 160);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.strokeRect(x - 120, y - 80, 240, 160);
      ctx.fillStyle = '#737373'; ctx.font = '700 20px Inter'; ctx.fillText(label, x, y - 30);
      ctx.fillStyle = color; ctx.font = '900 60px Inter'; ctx.fillText(val, x, y + 40);
  };

  const drawAffinity = (ctx: any, label: string, p: Player | undefined, x: number, y: number, color: string) => {
      ctx.fillStyle = color + '22'; ctx.fillRect(x - 300, y - 80, 600, 160);
      ctx.strokeStyle = color + '44'; ctx.strokeRect(x - 300, y - 80, 600, 160);
      ctx.textAlign = 'left';
      ctx.fillStyle = color; ctx.font = '900 25px Inter'; ctx.fillText(label, x - 270, y - 10);
      ctx.fillStyle = '#ffffff'; ctx.font = '900 45px Inter'; ctx.fillText(p ? p.name.split(' ')[0] : '---', x - 270, y + 45);
      ctx.textAlign = 'right'; ctx.font = '900 80px Inter'; ctx.fillText(p?.emoji || '❔', x + 270, y + 30);
      ctx.textAlign = 'center';
  };

  const startRecording = async () => {
    if (isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      chunksRef.current = [];

      // Setup Canvas 9:16 (HD 720p)
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d', { alpha: false })!;

      // Stream e Recorder
      const stream = canvas.captureStream(FPS);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 
                       MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      
      const recorder = new MediaRecorder(stream, { 
        mimeType, 
        videoBitsPerSecond: 6000000 
      });

      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `REI-DA-MESA-${player.name.toUpperCase()}.mp4`;
        a.click();
        setIsRecording(false);
      };

      recorder.start();
      
      let frame = 0;
      const totalFrames = FPS * (TOTAL_DURATION / 1000);
      let lastScreenTrigger = -1;

      const recordLoop = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const currentTime = (frame / FPS) * 1000;
        const screen = Math.floor(currentTime / SCREEN_DURATION);
        const prog = ((currentTime % SCREEN_DURATION) / SCREEN_DURATION) * 100;

        // Som sincronizado na gravação (através do playback local)
        if (screen !== lastScreenTrigger) {
            playArcadeSound('point');
            lastScreenTrigger = screen;
            setCurrentScreen(screen); // Atualiza UI para o usuário ver progresso
        }
        setProgress(prog);

        drawCanvasFrame(ctx, screen, prog);

        frame++;
        requestAnimationFrame(recordLoop);
      };

      recordLoop();
    } catch (e) {
      console.error(e);
      alert("Erro ao gravar vídeo. Use o print para compartilhar!");
      setIsRecording(false);
    }
  };

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 overflow-hidden select-none">
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Barras de Progresso UI */}
      <div className="absolute top-6 left-4 right-4 flex gap-1 z-[210]">
        {[...Array(SCREENS_COUNT)].map((_, i) => (
          <div key={i} className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#4ade80] shadow-[0_0_10px_#4ade8055]"
              style={{ 
                width: i < currentScreen ? '100%' : i === currentScreen ? `${progress}%` : '0%',
                transition: isRecording ? 'none' : 'width 0.1s linear'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header UI */}
      <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-[210]">
          <div className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-lg">{player.emoji}</span>
              <div className="flex flex-col">
                <span className="font-arcade text-white text-[10px] tracking-tight">{player.name}</span>
                <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">Destaques de Elite</span>
              </div>
          </div>
          <div className="flex gap-2">
            {!isRecording && (
                <button 
                  onClick={startRecording}
                  className="bg-[#4ade80] text-black h-10 px-4 rounded-xl active:scale-95 transition-all flex items-center gap-2 font-arcade text-[10px] shadow-lg shadow-[#4ade8022]"
                >
                    <Video size={16} /> GRAVAR
                </button>
            )}
            <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-xl text-white/50 hover:text-white flex items-center justify-center transition-colors">
                <X size={20} />
            </button>
          </div>
      </div>

      {/* Conteúdo Animado UI */}
      <div className={`w-full max-w-lg h-full flex flex-col items-center justify-center text-center px-4 relative transition-opacity duration-300 ${isRecording ? 'opacity-20' : 'opacity-100'}`}>
        
        {isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 animate-pulse">
                <Loader2 size={48} className="text-[#4ade80] animate-spin mb-4" />
                <p className="font-arcade text-white text-sm">ENCODANDO VÍDEO...</p>
                <p className="text-zinc-500 text-[8px] uppercase mt-2 tracking-widest">Renderizando frames em 720p</p>
            </div>
        )}

        {/* Telas da UI (Similares ao Canvas) */}
        <div className="space-y-6">
            {currentScreen === 0 && (
                <div className="animate-in zoom-in duration-500">
                    <div className="text-[120px] mb-8 drop-shadow-2xl animate-bounce">{player.emoji}</div>
                    <h2 className="font-arcade text-4xl text-white mb-2">{player.name}</h2>
                    <div className="bg-[#4ade80] text-black font-arcade px-4 py-2 text-lg rounded-xl rotate-[-2deg]">SHOW DE BOLA!</div>
                </div>
            )}
            
            {currentScreen === 1 && (
                <div className="animate-in slide-in-from-right duration-500 space-y-8">
                    <h3 className="font-arcade text-zinc-500 text-xs">RESUMO DA ARENA</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <StatBox label="GAMES" value={player.stats.matches} color="text-white" />
                        <StatBox label="VITÓRIAS" value={player.stats.wins} color="text-[#4ade80]" />
                        <StatBox label="WR%" value={`${stats.winRate}%`} color="text-blue-400" />
                        <StatBox label="STREAK" value={player.stats.maxConsecutiveWins} color="text-orange-500" />
                    </div>
                </div>
            )}

            {currentScreen === 2 && (
                <div className="animate-in slide-in-from-bottom duration-500 space-y-12">
                    <h3 className="font-arcade text-zinc-500 text-xs">ESTILO DE JOGO</h3>
                    <div className="flex gap-8 items-end h-32">
                        <Bar label="SOLO" val={player.stats.soloMatches} total={player.stats.matches} color="bg-blue-500" />
                        <Bar label="DUPLA" val={player.stats.duplasMatches} total={player.stats.matches} color="bg-purple-500" />
                    </div>
                </div>
            )}

            {currentScreen >= 3 && currentScreen <= 5 && (
                 <div className="animate-in fade-in duration-500 space-y-4">
                    <h3 className="font-arcade text-zinc-500 text-xs mb-8 uppercase">
                        {currentScreen === 3 ? "PARCERIAS" : currentScreen === 4 ? "PNEUS" : "RIVALIDADES"}
                    </h3>
                    {currentScreen === 3 && (
                        <>
                            <AffinityUI label="SINTONIA FINA" p={stats.bestFriend} color="text-pink-500" />
                            <AffinityUI label="FORA DE RITMO" p={stats.badVibe} color="text-zinc-400" />
                        </>
                    )}
                    {currentScreen === 4 && (
                        <div className="flex gap-4">
                             <StatBox label="APLICADOS" value={player.stats.pneusApplied} color="text-green-500" />
                             <StatBox label="SOFRIDOS" value={player.stats.pneusReceived} color="text-red-500" />
                        </div>
                    )}
                    {currentScreen === 5 && (
                        <>
                            <AffinityUI label="CARRASCO" p={stats.nemesis} color="text-red-500" />
                            <AffinityUI label="FREGUÊS" p={stats.client} color="text-green-500" />
                        </>
                    )}
                 </div>
            )}

            {currentScreen === 6 && (
                <div className="animate-in zoom-in duration-700 flex flex-col items-center">
                    <Crown size={80} className="text-yellow-500 mb-6 animate-pulse" />
                    <h2 className="font-arcade text-5xl text-white mb-2">{player.emoji}</h2>
                    <h2 className="font-arcade text-3xl text-white uppercase">{player.name}</h2>
                    <span className="text-[#eab308] font-arcade text-xs mt-4">REI DA MESA</span>
                </div>
            )}
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none blur-3xl">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#4ade80] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full"></div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl min-w-[140px]">
        <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
        <div className={`font-arcade text-3xl ${color}`}>{value}</div>
    </div>
);

const Bar = ({ label, val, total, color }: any) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 rounded-t-lg ${color}`} style={{ height: `${(val / (total || 1)) * 100}%`, minHeight: '10px' }} />
        <span className="font-arcade text-[8px] text-white">{label}</span>
        <span className="font-arcade text-xs text-zinc-500">{val}</span>
    </div>
);

const AffinityUI = ({ label, p, color }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl flex items-center justify-between w-full max-w-sm">
        <div className="text-left">
            <div className={`text-[8px] font-bold uppercase tracking-widest ${color}`}>{label}</div>
            <div className="font-arcade text-lg text-white">{p ? p.name.split(' ')[0] : '---'}</div>
        </div>
        <span className="text-4xl">{p?.emoji || '❔'}</span>
    </div>
);

export default HighlightsOverlay;
