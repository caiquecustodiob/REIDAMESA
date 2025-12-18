
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState, Player, Match } from '../types';
import { Trophy, Ghost, Crown, Smile, Share2, Download, Play, X, ChevronLeft, ChevronRight, Zap, Flame, Award, Star, History, Video, Loader2 } from 'lucide-react';

interface Props {
  state: AppState;
}

const StatsView: React.FC<Props> = ({ state }) => {
  const { players, history } = state;
  const [arenaMode, setArenaMode] = useState(false);
  const [arenaIndex, setArenaIndex] = useState(0);
  const [highlightPlayerId, setHighlightPlayerId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sortedPlayers = useMemo(() => {
    return (Object.values(players) as Player[]).sort((a, b) => {
      if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
      if (b.stats.consecutiveWins !== a.stats.consecutiveWins) return b.stats.consecutiveWins - a.stats.consecutiveWins;
      if (b.stats.pointsScored !== a.stats.pointsScored) return b.stats.pointsScored - a.stats.pointsScored;
      return b.stats.pneusApplied - a.stats.pneusApplied;
    });
  }, [players]);

  const weeklyKingId = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyWins: Record<string, number> = {};
    history.filter(m => m.timestamp > weekAgo).forEach(m => {
      const winners = m.winner === 'A' ? m.sideA : m.sideB;
      winners.forEach(id => { weeklyWins[id] = (weeklyWins[id] || 0) + 1; });
    });
    return Object.entries(weeklyWins).sort(([, a], [, b]) => b - a)[0]?.[0];
  }, [history]);

  const getPlayerMeta = (p: Player, rank: number) => {
    let nemesisId = '';
    let clientId = '';
    let maxNemesisLosses = 0;
    let maxClientWins = 0;

    Object.entries(p.rivalries).forEach(([rid, stats]: [string, any]) => {
      if (stats.lossesTo > maxNemesisLosses) { maxNemesisLosses = stats.lossesTo; nemesisId = rid; }
      if (stats.winsAgainst > maxClientWins) { maxClientWins = stats.winsAgainst; clientId = rid; }
    });

    const frases = [];
    if (rank === 0 || p.stats.consecutiveWins >= 5) frases.push({ text: "👑 IMBATÍVEL NA MESA", color: "#eab308" });
    if (p.stats.pneusApplied >= 2) frases.push({ text: "🚜 ALERTA: PASSA TRATOR", color: "#4ade80" });
    if (maxNemesisLosses >= 3 && players[nemesisId]) frases.push({ text: `😈 FREGUÊS DO ${players[nemesisId].name.toUpperCase()}`, color: "#ef4444" });

    return { nemesis: players[nemesisId], client: players[clientId], frases, maxNemesisLosses, maxClientWins };
  };

  // --- LÓGICA DE GRAVAÇÃO DE VÍDEO ---
  const recordHighlights = async (p: Player) => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rank = sortedPlayers.findIndex(pl => pl.id === p.id);
    const meta = getPlayerMeta(p, rank);
    const stream = canvas.captureStream(30);
    
    // Suporte a diferentes tipos de Mime para iOS/Android
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    
    try {
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `REI-DA-MESA-${p.name.toUpperCase()}-HIGHLIGHTS.${mimeType.split('/')[1]}`;
          a.click();
          setIsRecording(false);
        };

        recorder.start();

        // Sequência de Desenho (5 passos, 2s cada)
        for (let step = 0; step < 5; step++) {
          setCurrentStep(step);
          drawToCanvas(ctx, p, step, meta);
          await new Promise(r => setTimeout(r, 2000));
        }

        recorder.stop();
    } catch (e) {
        console.error("Erro ao gravar vídeo:", e);
        // Fallback para download de imagem simples se MediaRecorder falhar (comum em iOS antigos)
        const link = document.createElement('a');
        link.download = 'destaque.png';
        link.href = canvas.toDataURL();
        link.click();
        setIsRecording(false);
    }
  };

  const drawToCanvas = (ctx: CanvasRenderingContext2D, p: Player, step: number, meta: any) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Gradiente decorativo
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, h/1.5);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Step Logic
    if (step === 0) {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 80px Bungee, cursive';
      ctx.fillText('REI DA MESA', w/2, h/2 - 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Bungee, cursive';
      ctx.fillText('SHOW DE BOLA!', w/2, h/2 + 20);
      ctx.fillStyle = '#737373';
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText(`DESTAQUES DE ${p.name.toUpperCase()}`, w/2, h/2 + 100);
    } else if (step === 1) {
      ctx.font = '200px serif';
      ctx.fillText(p.emoji, w/2, h/2 - 150);
      ctx.fillStyle = '#ffffff';
      ctx.font = '60px Bungee, cursive';
      ctx.fillText(`VENCEU ${p.stats.wins}`, w/2, h/2 + 50);
      ctx.fillStyle = '#4ade80';
      ctx.font = '30px Bungee, cursive';
      ctx.fillText('PARTIDAS!', w/2, h/2 + 130);
    } else if (step === 2) {
      ctx.font = '150px serif';
      ctx.fillText('🚜', w/2, h/2 - 150);
      ctx.fillStyle = '#ffffff';
      ctx.font = '60px Bungee, cursive';
      ctx.fillText(`${p.stats.pneusApplied} PNEUS`, w/2, h/2 + 50);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '30px Bungee, cursive';
      ctx.fillText('PASSOU O TRATOR!', w/2, h/2 + 130);
    } else if (step === 3) {
      ctx.font = '150px serif';
      ctx.fillText('😈', w/2, h/2 - 150);
      ctx.fillStyle = '#ffffff';
      ctx.font = '45px Bungee, cursive';
      const rivalName = meta.client?.name || 'GERAL';
      ctx.fillText(`AMASSOU O ${rivalName.toUpperCase()}`, w/2, h/2 + 50);
      ctx.fillStyle = '#ef4444';
      ctx.font = '30px Bungee, cursive';
      ctx.fillText('CLIENTE FIEL DA MESA!', w/2, h/2 + 130);
    } else if (step === 4) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 90px Bungee, cursive';
      ctx.save();
      ctx.translate(w/2, h/2 - 50);
      ctx.rotate(-0.1);
      ctx.fillText('REI DA MESA', 0, 0);
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.font = '30px Bungee, cursive';
      ctx.fillText('AQUI A MESA TEM DONO.', w/2, h/2 + 100);
    }
  };

  const downloadCard = async (id: string, name: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const actions = el.querySelector('.card-actions');
    if (actions) (actions as HTMLElement).style.display = 'none';
    try {
      const canvas = await (window as any).html2canvas(el, { backgroundColor: '#09090b', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `REI-DA-MESA-${name.toUpperCase()}.png`;
      link.click();
    } finally {
      if (actions) (actions as HTMLElement).style.display = 'flex';
    }
  };

  if (sortedPlayers.length === 0) return <div className="p-20 text-center font-arcade opacity-20">Arena Vazia...</div>;

  const highlightPlayer = highlightPlayerId ? players[highlightPlayerId] : null;
  const highlightMeta = highlightPlayer ? getPlayerMeta(highlightPlayer, sortedPlayers.findIndex(p => p.id === highlightPlayerId)) : null;

  return (
    <div className="p-4 space-y-10 pb-28 max-w-4xl mx-auto">
      {/* Canvas Oculto para Gravação de Vídeo */}
      <canvas ref={canvasRef} width={1080} height={1920} className="hidden" />

      {/* Interface Global */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-[2rem] border border-zinc-800">
        <div className="flex flex-col">
          <h2 className="font-arcade text-xl text-white">Ranking Global</h2>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{sortedPlayers.length} ATLETAS ATIVOS</span>
        </div>
        <button 
          onClick={() => { setArenaMode(true); setArenaIndex(0); }}
          className="bg-yellow-500 text-black px-6 py-3 rounded-2xl font-arcade text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse"
        >
          <Play size={14} fill="currentColor" /> MODO ARENA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {sortedPlayers[1] && <PodiumCard p={sortedPlayers[1]} pos={2} color="border-zinc-500 bg-zinc-500/5" />}
        {sortedPlayers[0] && <PodiumCard p={sortedPlayers[0]} pos={1} color="border-yellow-500 bg-yellow-500/10 scale-110 z-10 shadow-[0_0_50px_rgba(234,179,8,0.1)]" isKing={sortedPlayers[0].id === weeklyKingId} />}
        {sortedPlayers[2] && <PodiumCard p={sortedPlayers[2]} pos={3} color="border-orange-800 bg-orange-800/5" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {sortedPlayers.map((p, idx) => {
          const { nemesis, client, frases } = getPlayerMeta(p, idx);
          const winRate = p.stats.matches ? Math.round((p.stats.wins/p.stats.matches)*100) : 0;
          const isWeeklyKing = p.id === weeklyKingId;

          return (
            <div key={p.id} className="relative group">
              <div id={`card-${p.id}`} className="bg-[#0a0a0a] p-8 pt-12 rounded-[3.5rem] border border-zinc-800 space-y-6 shadow-2xl relative overflow-hidden transition-transform hover:scale-[1.02]">
                {isWeeklyKing && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[9px] font-arcade py-2 flex justify-center items-center gap-2 z-20">
                    <Crown size={12} fill="currentColor" /> REI DA MESA DA SEMANA
                  </div>
                )}

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-arcade text-[8px] text-[#4ade80] px-2.5 py-1 bg-[#4ade801a] rounded-lg border border-[#4ade8033] w-fit">RANK #{idx + 1}</span>
                    <span className={`text-[8px] font-bold px-2.5 py-1 rounded-lg border w-fit ${winRate > 50 ? 'text-green-500 border-green-900' : 'text-red-500 border-red-900'}`}>{winRate}% WR</span>
                  </div>
                  <div className="card-actions flex gap-2">
                    <button onClick={() => { setHighlightPlayerId(p.id); setCurrentStep(0); }} className="p-2.5 bg-zinc-900 rounded-xl text-yellow-500 border border-yellow-500/20"><History size={18} /></button>
                    <button onClick={() => downloadCard(`card-${p.id}`, p.name)} className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white border border-white/5"><Download size={18} /></button>
                  </div>
                </div>

                <div className="text-center space-y-2 relative z-10">
                  <div className="text-8xl mb-2 flex justify-center drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">{p.emoji}</div>
                  <h3 className="font-arcade text-3xl text-white tracking-tighter">{p.name}</h3>
                  <div className="flex justify-center gap-2 flex-wrap min-h-[20px]">
                    {frases.map((f, i) => (
                      <span key={i} style={{color: f.color}} className="text-[8px] font-arcade px-3 py-1.5 rounded-lg border border-current/20">{f.text}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 relative z-10">
                  <StatBox label="VITÓRIAS" value={p.stats.wins} color="text-[#4ade80]" />
                  <StatBox label="PONTOS" value={p.stats.pointsScored} color="text-yellow-500" />
                  <StatBox label="TRATOR" value={p.stats.pneusApplied} color="text-blue-400" />
                  <StatBox label="DERROTAS" value={p.stats.losses} color="text-red-500" />
                  <StatBox label="SEQUÊNCIA" value={p.stats.consecutiveWins} color="text-orange-500" />
                  <StatBox label="ESTEPE" value={p.stats.pneusReceived} color="text-zinc-600" />
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-900/50 relative z-10">
                  <RivalBox label="NÊMESIS" p={nemesis} type="danger" icon={<Ghost size={14} />} sub="Carrasco" />
                  <RivalBox label="FREGUÊS" p={client} type="success" icon={<Smile size={14} />} sub="Cliente Fiel" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODO ARENA OVERLAY --- */}
      {arenaMode && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
          <button onClick={() => setArenaMode(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white z-[110] bg-zinc-900 p-4 rounded-full"><X size={32} /></button>
          <div className="bg-zinc-900 p-12 rounded-[5rem] border-4 border-yellow-500/30 text-center space-y-10">
                <div className="text-[140px] animate-bounce">{sortedPlayers[arenaIndex].emoji}</div>
                <h2 className="font-arcade text-6xl text-white">{sortedPlayers[arenaIndex].name}</h2>
                <div className="font-arcade text-2xl text-[#4ade80]">RANK # {arenaIndex + 1}</div>
          </div>
        </div>
      )}

      {/* --- MODO HIGHLIGHTS SEQUENCIAL --- */}
      {highlightPlayerId && highlightPlayer && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
           <button onClick={() => setHighlightPlayerId(null)} className="absolute top-8 right-8 text-zinc-500 z-[110] bg-zinc-900 p-3 rounded-xl"><X size={24} /></button>

           <div className="w-full max-w-sm relative aspect-[9/16] bg-zinc-900 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col">
              <div className="flex gap-1 p-4 absolute top-0 left-0 right-0 z-50">
                  {[0,1,2,3,4].map(step => (
                      <div key={step} className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-yellow-500 transition-all duration-100 ${step < currentStep ? 'w-full' : step === currentStep ? 'w-full animate-progress' : 'w-0'}`}></div>
                      </div>
                  ))}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                  {currentStep === 0 && <HighlightScreen icon={<Trophy size={64} fill="currentColor" />} title="Show de Bola!" sub={`Destaques de ${highlightPlayer.name}`} color="text-yellow-500" />}
                  {currentStep === 1 && <HighlightScreen icon={<span className="text-8xl">{highlightPlayer.emoji}</span>} title={`Venceu ${highlightPlayer.stats.wins}`} sub="Partidas Épicas!" color="text-[#4ade80]" />}
                  {currentStep === 2 && <HighlightScreen icon={<span className="text-8xl">🚜</span>} title={`${highlightPlayer.stats.pneusApplied} Pneus`} sub="Passou o trator!" color="text-blue-400" />}
                  {currentStep === 3 && <HighlightScreen icon={<span className="text-8xl">😈</span>} title={`Amassou o ${highlightMeta?.client?.name || 'Geral'}`} sub="Cliente Fiel!" color="text-red-500" />}
                  {currentStep === 4 && <HighlightScreen icon={<span className="text-8xl">👑</span>} title="REI DA MESA" sub="Aqui a mesa tem dono." color="text-yellow-500" />}
              </div>

              <div className="flex justify-between p-8 border-t border-zinc-800 relative z-10 bg-black/20">
                  <button onClick={() => setCurrentStep(s => Math.max(0, s-1))} className="p-4 rounded-2xl bg-zinc-800 text-white"><ChevronLeft size={24} /></button>
                  <button 
                    disabled={isRecording}
                    onClick={() => {
                        if (currentStep < 4) setCurrentStep(s => s + 1);
                        else recordHighlights(highlightPlayer);
                    }} 
                    className="flex-1 mx-4 rounded-2xl bg-[#4ade80] text-black font-arcade text-[10px] flex items-center justify-center gap-2"
                  >
                      {isRecording ? <Loader2 size={16} className="animate-spin" /> : currentStep < 4 ? 'PRÓXIMO' : 'BAIXAR VÍDEO'}
                  </button>
                  <button onClick={() => { if(currentStep < 4) setCurrentStep(s => s + 1); }} className="p-4 rounded-2xl bg-zinc-800 text-white"><ChevronRight size={24} /></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const HighlightScreen = ({ icon, title, sub, color }: any) => (
    <div className="animate-in fade-in duration-500 flex flex-col items-center gap-6">
        <div className={`${color} drop-shadow-2xl animate-bounce`}>{icon}</div>
        <h2 className={`font-arcade text-4xl text-white uppercase`}>{title}</h2>
        <div className={`${color} font-arcade text-lg`}>{sub}</div>
    </div>
);

const PodiumCard = ({ p, pos, color, isKing }: { p: Player, pos: number, color: string, isKing?: boolean }) => (
  <div className={`p-6 rounded-[3rem] border-2 flex flex-col items-center text-center space-y-3 relative transition-all ${color} shadow-2xl`}>
    {isKing && (
        <div className="absolute -top-6 -right-2 bg-yellow-500 text-black p-3 rounded-full shadow-lg z-20 animate-pulse">
            <Crown size={24} fill="currentColor" />
        </div>
    )}
    <div className="text-7xl mb-1">{p.emoji}</div>
    <h3 className="font-arcade text-xl text-white truncate w-full">{p.name}</h3>
    <div className="text-[10px] font-bold text-zinc-500 uppercase">{p.stats.wins} VIT | {p.stats.pneusApplied} 🛞</div>
  </div>
);

const StatBox = ({ label, value, color }: { label: string, value: any, color: string }) => (
    <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/30 flex flex-col items-center text-center">
        <div className="text-[7px] font-bold text-zinc-600 mb-1 uppercase">{label}</div>
        <div className={`font-arcade text-lg ${color}`}>{value}</div>
    </div>
);

const RivalBox = ({ label, p, type, icon, sub }: { label: string, p: any, type: 'danger' | 'success', icon: any, sub: string }) => (
    <div className={`flex items-center justify-between p-3 rounded-2xl bg-black/40 border transition-all ${type === 'danger' ? 'border-red-900/10' : 'border-green-900/10'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{icon}</div>
            <div className="flex flex-col">
                <div className="text-[8px] font-arcade text-zinc-500 uppercase tracking-widest">{label}</div>
                <div className="text-[7px] text-zinc-600 font-bold uppercase">{sub}</div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-white font-arcade text-xs truncate max-w-[80px]">{p ? p.name : 'VAGO'}</span>
            <span className="text-2xl">{p?.emoji || '❔'}</span>
        </div>
    </div>
);

export default StatsView;
