
import React, { useMemo } from 'react';
import { AppState, Player } from '../types';
import { Trophy, Zap, Ghost, Target, Star, ShieldAlert, Crown, Smile, Share2, Download, Image as ImageIcon } from 'lucide-react';

interface Props {
  state: AppState;
}

const StatsView: React.FC<Props> = ({ state }) => {
  const { players, history } = state;

  const sortedPlayers = useMemo(() => {
    return (Object.values(players) as Player[]).sort((a, b) => b.stats.wins - a.stats.wins || b.stats.pointsScored - a.stats.pointsScored);
  }, [players]);

  const getRivalryInfo = (p: Player) => {
    let nemesisId = '';
    let clientId = '';
    let maxNemesisLosses = 0;
    let maxClientWins = 0;

    Object.entries(p.rivalries).forEach(([rid, stats]: [string, any]) => {
      if (stats.lossesTo > maxNemesisLosses) {
        maxNemesisLosses = stats.lossesTo;
        nemesisId = rid;
      }
      if (stats.winsAgainst > maxClientWins) {
        maxClientWins = stats.winsAgainst;
        clientId = rid;
      }
    });

    return { 
      nemesis: players[nemesisId], 
      client: players[clientId] 
    };
  };

  const downloadPlayerCard = async (playerId: string, playerName: string) => {
    const cardElement = document.getElementById(`player-card-${playerId}`);
    if (!cardElement) return;

    // Feedback visual de carregamento (opcional se for rápido)
    const originalStyle = cardElement.style.transform;
    cardElement.style.transform = 'scale(1)'; // Reset transform for capture

    try {
      const canvas = await (window as any).html2canvas(cardElement, {
        backgroundColor: '#09090b', // zinc-950
        scale: 2, // Double scale for high res
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `REI-DA-MESA-${playerName.toUpperCase()}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar card:", error);
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      cardElement.style.transform = originalStyle;
    }
  };

  const sharePlayerStats = (p: Player) => {
    const winRate = p.stats.matches ? Math.round((p.stats.wins / p.stats.matches) * 100) : 0;
    const text = `🏓 REI DA MESA - STATUS DO GUERREIRO 🏓\n\n` +
                 `👤 Atleta: ${p.emoji} ${p.name}\n` +
                 `⭐ Nível: ${p.level}\n` +
                 `🏆 Vitórias: ${p.stats.wins}\n` +
                 `🔥 Maior Sequência: ${p.stats.maxConsecutiveWins}\n` +
                 `📊 Taxa de Vitória: ${winRate}%\n` +
                 `🎯 Pontos Totais: ${p.stats.pointsScored}\n\n` +
                 `"Aqui não é sorte. É mesa."\n` +
                 `${window.location.origin}`;

    if (navigator.share) {
      navigator.share({
        title: `Estatísticas de ${p.name} - REI DA MESA`,
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
        alert('Texto copiado!');
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado!');
    }
  };

  if (sortedPlayers.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-700 text-center">
            <Trophy size={64} className="mb-4 opacity-20" />
            <p className="font-arcade">Ainda não há campeões registrados nesta arena.</p>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-10">
      <div className="space-y-4">
          <h2 className="font-arcade text-2xl text-white">Ranking da Arena</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedPlayers.slice(0, 3).map((p, idx) => (
                  <div key={p.id} className={`relative overflow-hidden p-6 rounded-3xl border-2 transition-all ${
                      idx === 0 ? 'bg-[#eab30822] border-[#eab308] glow-gold scale-[1.05] z-10' : 
                      idx === 1 ? 'bg-zinc-100/10 border-zinc-400' : 
                      'bg-orange-900/10 border-orange-700'
                  }`}>
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Trophy size={100} />
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <div className="text-5xl">{p.emoji}</div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <h3 className="font-arcade text-xl truncate max-w-[120px]">{p.name}</h3>
                                  {idx === 0 && <Crown size={20} className="text-yellow-500 shrink-0" />}
                              </div>
                              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{p.level} • {p.stats.wins} VITÓRIAS</div>
                          </div>
                          <div className="font-arcade text-3xl">#{idx + 1}</div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <div className="space-y-4">
          <h2 className="font-arcade text-2xl text-white">Cards de Personagem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPlayers.map(p => {
                  const { nemesis, client } = getRivalryInfo(p);
                  return (
                      <div key={p.id} className="relative group">
                          {/* Card UI */}
                          <div 
                            id={`player-card-${p.id}`}
                            className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-6 shadow-2xl transition-colors relative"
                          >
                              {/* Overlay for branding when captured */}
                              <div className="flex justify-between items-start mb-2">
                                  <span className="font-arcade text-[10px] text-[#4ade8055]">REI DA MESA</span>
                                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                              </div>

                              <div className="text-center space-y-2">
                                  <div className="text-6xl mb-2 flex justify-center">{p.emoji}</div>
                                  <h3 className="font-arcade text-2xl text-[#4ade80] truncate">{p.name}</h3>
                                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-bold uppercase tracking-tighter">{p.level}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                  <StatItem label="PARTIDAS" value={p.stats.matches} icon={<Zap size={14} />} />
                                  <StatItem label="WIN RATE" value={p.stats.matches ? `${Math.round((p.stats.wins/p.stats.matches)*100)}%` : '0%'} icon={<Star size={14} />} />
                                  <StatItem label="PONTOS" value={p.stats.pointsScored} icon={<Target size={14} />} />
                                  <StatItem label="MAX STREAK" value={p.stats.maxConsecutiveWins} icon={<Crown size={14} />} />
                              </div>

                              <div className="space-y-2 pt-4 border-t border-zinc-800">
                                  <RivalryItem label="NÊMESIS" p={nemesis} type="danger" icon={<Ghost size={16} />} />
                                  <RivalryItem label="FREGUÊS" p={client} type="success" icon={<Smile size={16} />} />
                              </div>
                              
                              <div className="text-[8px] font-arcade text-center opacity-20 pt-2 uppercase">
                                  Aqui não é sorte. É mesa.
                              </div>
                          </div>

                          {/* Action Buttons (Not part of capture) */}
                          <div className="absolute top-4 right-4 flex gap-2">
                              <button 
                                onClick={() => downloadPlayerCard(p.id, p.name)}
                                className="p-2 bg-zinc-800/80 backdrop-blur rounded-full text-zinc-400 hover:text-[#4ade80] hover:bg-zinc-700 transition-all shadow-lg"
                                title="Baixar Card (Imagem)"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => sharePlayerStats(p)}
                                className="p-2 bg-zinc-800/80 backdrop-blur rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-lg"
                                title="Compartilhar Texto"
                              >
                                <Share2 size={18} />
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>

      {history.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-arcade text-2xl text-white">Últimas Batalhas</h2>
            <div className="space-y-2">
                {history.map(m => (
                    <div key={m.id} className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex-1 flex items-center gap-2">
                            <span className={m.winner === 'A' ? 'text-[#4ade80] font-bold' : 'text-zinc-500'}>
                                {m.sideA.map(pid => players[pid]?.name).join(' & ')}
                            </span>
                        </div>
                        <div className="px-3 font-arcade text-sm">
                            <span className={m.winner === 'A' ? 'text-[#4ade80]' : ''}>{m.scoreA}</span>
                            <span className="mx-1 opacity-30">-</span>
                            <span className={m.winner === 'B' ? 'text-[#4ade80]' : ''}>{m.scoreB}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-end gap-2">
                            <span className={m.winner === 'B' ? 'text-[#4ade80] font-bold' : 'text-zinc-500'}>
                                {m.sideB.map(pid => players[pid]?.name).join(' & ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, icon }: { label: string, value: any, icon: any }) => (
    <div className="bg-zinc-800/50 p-3 rounded-xl">
        <div className="text-[9px] font-bold text-zinc-500 mb-1 flex items-center gap-1 uppercase">{icon} {label}</div>
        <div className="font-arcade text-lg text-white">{value}</div>
    </div>
);

const RivalryItem = ({ label, p, type, icon }: { label: string, p: any, type: 'danger' | 'success', icon: any }) => (
    <div className="flex items-center justify-between p-2 rounded-xl bg-black/30">
        <div className="flex items-center gap-2">
            <div className={type === 'danger' ? 'text-red-500' : 'text-green-500'}>{icon}</div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-white font-arcade text-[10px] truncate max-w-[80px]">{p ? p.name : 'NENHUM'}</span>
            <span className="text-lg">{p?.emoji}</span>
        </div>
    </div>
);

export default StatsView;
