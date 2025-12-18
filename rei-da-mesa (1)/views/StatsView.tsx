
import React, { useMemo, useRef } from 'react';
import { AppState, Player } from '../types';
import { 
  Crown, Download, Users, User, Heart, Skull, 
  Zap, Target, Flame, Ghost, Smile, Info, PlayCircle
} from 'lucide-react';

interface Props {
  state: AppState;
  onShowHighlights: (id: string) => void;
}

const StatsView: React.FC<Props> = ({ state, onShowHighlights }) => {
  const { players, history } = state;

  const sortedPlayers = useMemo(() => {
    return (Object.values(players) as Player[]).sort((a, b) => {
      if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
      if (b.stats.consecutiveWins !== a.stats.consecutiveWins) return b.stats.consecutiveWins - a.stats.consecutiveWins;
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

  if (sortedPlayers.length === 0) {
    return (
      <div className="p-20 text-center font-arcade opacity-20 text-white">
        A Arena está vazia...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-10 pb-28 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-[2rem] border border-zinc-800">
        <div className="flex flex-col">
          <h2 className="font-arcade text-xl text-white">Mural da Glória</h2>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Performance em Tempo Real</span>
        </div>
        <div className="bg-zinc-800/50 p-2 rounded-xl text-zinc-500">
           <Info size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedPlayers.map((p, idx) => (
          <PlayerCard 
            key={p.id} 
            p={p} 
            rank={idx + 1} 
            isWeeklyKing={p.id === weeklyKingId} 
            players={players}
            onShowHighlights={() => onShowHighlights(p.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface PlayerCardProps {
  p: Player;
  rank: number;
  isWeeklyKing: boolean;
  players: Record<string, Player>;
  onShowHighlights: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ p, rank, isWeeklyKing, players, onShowHighlights }) => {
  const meta = useMemo(() => {
    let nemesisId = '';
    let clientId = '';
    let maxNemesisLosses = 0;
    let maxClientWins = 0;

    Object.entries(p.rivalries).forEach(([rid, stats]) => {
      const s = stats as { winsAgainst: number; lossesTo: number };
      if (s.lossesTo > maxNemesisLosses) { maxNemesisLosses = s.lossesTo; nemesisId = rid; }
      if (s.winsAgainst > maxClientWins) { maxClientWins = s.winsAgainst; clientId = rid; }
    });

    let bestFriendId = '';
    let badVibeId = '';
    let maxPartnerWins = -1;
    let maxPartnerLosses = -1;

    if (p.partnerships) {
      Object.entries(p.partnerships).forEach(([pid, stats]) => {
        const s = stats as { wins: number; losses: number };
        if (s.wins > maxPartnerWins) { maxPartnerWins = s.wins; bestFriendId = pid; }
        if (s.losses > maxPartnerLosses) { maxPartnerLosses = s.losses; badVibeId = pid; }
      });
    }

    const phrases = [];
    if (rank === 1) phrases.push({ text: "O DONO DA MESA", color: "text-yellow-500", bg: "bg-yellow-500/10" });
    else if (p.stats.consecutiveWins >= 5) phrases.push({ text: "IMBATÍVEL 🔥", color: "text-orange-500", bg: "bg-orange-500/10" });
    if (p.stats.pneusApplied >= 2) phrases.push({ text: "PASSA TRATOR 🚜", color: "text-blue-400", bg: "bg-blue-400/10" });

    const winRate = p.stats.matches > 0 ? Math.round((p.stats.wins / p.stats.matches) * 100) : 0;

    return {
      nemesis: players[nemesisId],
      client: players[clientId],
      bestFriend: players[bestFriendId],
      badVibe: players[badVibeId],
      phrases,
      winRate
    };
  }, [p, rank, players]);

  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await (window as any).html2canvas(cardRef.current, { 
        backgroundColor: '#0a0a0a', 
        scale: 2,
        useCORS: true 
      });
      const link = document.createElement('a');
      link.download = `PERFIL-${p.name.toUpperCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) { console.error(e); }
  };

  return (
    <div 
      ref={cardRef}
      className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-6 flex flex-col shadow-2xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`font-arcade text-xs px-4 py-2 rounded-xl border ${
          rank === 1 ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg shadow-yellow-500/20' : 
          rank === 2 ? 'bg-zinc-300 text-black border-zinc-100' : 
          rank === 3 ? 'bg-orange-800 text-white border-orange-700' : 
          'bg-zinc-800 text-zinc-500 border-zinc-700'
        }`}>
          RANK #{rank}
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={onShowHighlights} 
             className="bg-[#4ade8022] text-[#4ade80] p-2 rounded-xl border border-[#4ade8044] active:scale-90 transition-all hover:bg-[#4ade8044]"
             title="Ver Highlights"
           >
              <PlayCircle size={20} />
           </button>
           {isWeeklyKing && (
             <div className="bg-yellow-500/10 text-yellow-500 font-arcade text-[9px] px-3 py-1.5 rounded-xl border border-yellow-500/20 flex items-center gap-2">
               <Crown size={12} fill="currentColor" /> REI DA SEMANA
             </div>
           )}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] animate-pulse">{p.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-arcade text-3xl text-white tracking-tighter uppercase truncate leading-none mb-2">{p.name}</h3>
          <div className="flex flex-wrap gap-2">
            {meta.phrases.map((f, i) => (
              <span key={i} className={`${f.bg} ${f.color} font-arcade text-[7px] px-2 py-1 rounded-md border border-current/10`}>
                {f.text}
              </span>
            ))}
          </div>
        </div>
        <button onClick={downloadCard} className="p-3 bg-zinc-800 rounded-2xl text-zinc-500 active:scale-90 hover:text-white transition-colors">
          <Download size={20} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <QuickStat label="GAMES" value={p.stats.matches} />
        <QuickStat label="WINS" value={p.stats.wins} color="text-green-500" />
        <QuickStat label="LOSS" value={p.stats.losses} color="text-red-500" />
        <QuickStat label="WR%" value={`${meta.winRate}%`} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <DetailBox label="STREAK" value={p.stats.maxConsecutiveWins} icon={<Flame size={14} className="text-orange-500" />} />
        <DetailBox label="PNEUS +" value={p.stats.pneusApplied} icon={<Zap size={14} className="text-yellow-500" />} />
        <DetailBox label="PNEUS -" value={p.stats.pneusReceived} icon={<Zap size={14} className="text-red-500" />} />
      </div>

      <div className="space-y-3 bg-black/30 p-4 rounded-[2rem] border border-white/5">
        <div className="flex justify-around items-center border-b border-white/5 pb-3">
            <StyleItem icon={<User size={14} />} label="SOLO" value={p.stats.soloMatches} />
            <div className="w-[1px] h-6 bg-zinc-800"></div>
            <StyleItem icon={<Users size={14} />} label="DUPLA" value={p.stats.duplasMatches} />
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <CompactAffinity label="MELHOR DUPLA" p={meta.bestFriend} icon={<Heart size={12} className="text-pink-500" />} />
          <CompactAffinity label="MAIOR RIVAL" p={meta.nemesis} icon={<Skull size={12} className="text-red-500" />} />
          <CompactAffinity label="SEU FREGUÊS" p={meta.client} icon={<Smile size={12} className="text-green-500" />} />
        </div>
      </div>

      <div className="mt-6 text-center">
         <span className="font-arcade text-[7px] text-zinc-700 tracking-[0.2em]">REI DA MESA ANALYTICS • V2.0</span>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, color = "text-white" }: any) => (
  <div className="bg-black/20 p-2 rounded-2xl border border-white/5 flex flex-col items-center">
    <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
    <span className={`font-arcade text-base ${color}`}>{value}</span>
  </div>
);

const DetailBox = ({ label, value, icon }: any) => (
  <div className="bg-zinc-800/50 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
    <div className="flex items-center gap-1.5 mb-1 opacity-50">
       {icon}
       <span className="text-[6px] font-bold text-zinc-400 uppercase">{label}</span>
    </div>
    <span className="font-arcade text-lg text-white">{value}</span>
  </div>
);

const StyleItem = ({ icon, label, value }: any) => (
    <div className="flex items-center gap-2">
        <div className="text-zinc-600">{icon}</div>
        <span className="text-[8px] font-bold text-zinc-500 uppercase">{label}:</span>
        <span className="text-[10px] font-arcade text-white">{value}</span>
    </div>
);

const CompactAffinity = ({ label, p, icon }: any) => (
  <div className="flex items-center justify-between px-2">
     <div className="flex items-center gap-2">
        {icon}
        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">{label}</span>
     </div>
     <div className="flex items-center gap-2">
        <span className="text-[9px] font-arcade text-zinc-300">{p ? p.name.split(' ')[0] : '---'}</span>
        <span className="text-lg">{p?.emoji || '❔'}</span>
     </div>
  </div>
);

export default StatsView;
