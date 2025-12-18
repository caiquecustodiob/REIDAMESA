
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, ListOrdered, Settings, Zap, Crown, Download, PlayCircle } from 'lucide-react';
import { Player, Match, AppState, GameMode } from './types';
import { INITIAL_PLAYERS } from './constants';
import { playArcadeSound } from './audio';

// --- Views ---
import GameView from './views/GameView';
import QueueView from './views/QueueView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';
import HighlightsOverlay from './views/HighlightsOverlay';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [highlightPlayerId, setHighlightPlayerId] = useState<string | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('rei-da-mesa-v1.4');
    if (saved) return JSON.parse(saved);
    
    const playersWithNewStats = { ...INITIAL_PLAYERS };
    Object.keys(playersWithNewStats).forEach(id => {
      const p = playersWithNewStats[id];
      if (!p.stats.soloMatches) p.stats.soloMatches = 0;
      if (!p.stats.duplasMatches) p.stats.duplasMatches = 0;
      if (!p.partnerships) p.partnerships = {};
    });

    return {
      players: playersWithNewStats,
      queue: Object.keys(playersWithNewStats),
      activeMatch: null,
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('rei-da-mesa-v1.4', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const addPlayer = (name: string, level: any, emoji: string) => {
    const id = Date.now().toString();
    const newPlayer: Player = {
      id, name, emoji, level, active: true,
      stats: { matches: 0, wins: 0, losses: 0, pointsScored: 0, consecutiveWins: 0, maxConsecutiveWins: 0, pneusApplied: 0, pneusReceived: 0, soloMatches: 0, duplasMatches: 0 },
      rivalries: {},
      partnerships: {}
    };
    setState(prev => ({
      ...prev,
      players: { ...prev.players, [id]: newPlayer },
      queue: [...prev.queue, id]
    }));
  };

  const startMatch = (mode: GameMode) => {
    setState(prev => {
      if (prev.queue.length < (mode === 'SOLO' ? 2 : 4)) return prev;
      const sideA = mode === 'SOLO' ? [prev.queue[0]] : [prev.queue[0], prev.queue[1]];
      const sideB = mode === 'SOLO' ? [prev.queue[1]] : [prev.queue[2], prev.queue[3]];
      return {
        ...prev,
        activeMatch: {
          id: Date.now().toString(),
          mode, sideA, sideB, scoreA: 0, scoreB: 0, winner: null, timestamp: Date.now(), isDeuce: false,
          maxTrailingA: 0, maxTrailingB: 0
        }
      };
    });
  };

  const updateScore = (side: 'A' | 'B', amount: number) => {
    if (!state.activeMatch) return;
    if (amount > 0) playArcadeSound('point');
    else playArcadeSound('remove');
    setState(prev => {
      if (!prev.activeMatch) return prev;
      const match = { ...prev.activeMatch };
      const limit = match.mode === 'SOLO' ? 7 : 10;
      const deuceTrigger = match.mode === 'SOLO' ? 6 : 9;
      const oldWinner = match.winner;

      if (side === 'A') match.scoreA = Math.max(0, match.scoreA + amount);
      if (side === 'B') match.scoreB = Math.max(0, match.scoreB + amount);

      // Rastrear maior desvantagem
      const diffA = match.scoreB - match.scoreA;
      const diffB = match.scoreA - match.scoreB;
      match.maxTrailingA = Math.max(match.maxTrailingA || 0, diffA);
      match.maxTrailingB = Math.max(match.maxTrailingB || 0, diffB);

      if (!match.isDeuce) {
        if (match.scoreA === 5 && match.scoreB === 0) match.winner = 'A';
        else if (match.scoreB === 5 && match.scoreA === 0) match.winner = 'B';
        else if (match.scoreA >= limit) match.winner = 'A';
        else if (match.scoreB >= limit) match.winner = 'B';
        else if (match.scoreA === deuceTrigger && match.scoreB === deuceTrigger) {
          match.isDeuce = true; match.scoreA = 0; match.scoreB = 0;
          playArcadeSound('deuce');
        }
      } else {
        if (match.scoreA === 1 && match.scoreB === 1) {
          match.scoreA = 0; match.scoreB = 0;
          playArcadeSound('remove');
        } else if (match.scoreA >= 2) match.winner = 'A';
        else if (match.scoreB >= 2) match.winner = 'B';
      }

      if (match.winner && !oldWinner) {
        // Checar se foi virada (estava perdendo por 2+)
        if (match.winner === 'A' && (match.maxTrailingA || 0) >= 2) match.isComeback = true;
        if (match.winner === 'B' && (match.maxTrailingB || 0) >= 2) match.isComeback = true;
        playArcadeSound('victory');
      }

      return { ...prev, activeMatch: match };
    });
  };

  const finishMatch = (autoStartNext: boolean = false) => {
    if (!state.activeMatch || !state.activeMatch.winner) return;
    const currentMode = state.activeMatch.mode;

    setState(prev => {
      const match = prev.activeMatch!;
      const isWinnerA = match.winner === 'A';
      const winnerIds = isWinnerA ? match.sideA : match.sideB;
      const loserIds = isWinnerA ? match.sideB : match.sideA;
      const winnerScore = isWinnerA ? match.scoreA : match.scoreB;
      const loserScore = isWinnerA ? match.scoreB : match.scoreA;
      const isPneu = winnerScore === 5 && loserScore === 0;

      const updatedPlayers = { ...prev.players };

      const updatePlayerStats = (id: string, isWinner: boolean, isPneu: boolean) => {
        const p = updatedPlayers[id];
        if (!p) return;
        p.stats.matches++;
        p.stats.pointsScored += isWinner ? winnerScore : loserScore;
        if (match.mode === 'SOLO') p.stats.soloMatches++;
        else p.stats.duplasMatches++;
        if (isWinner) {
          p.stats.wins++;
          p.stats.consecutiveWins++;
          p.stats.maxConsecutiveWins = Math.max(p.stats.maxConsecutiveWins, p.stats.consecutiveWins);
          if (isPneu) p.stats.pneusApplied++;
        } else {
          p.stats.losses++;
          p.stats.consecutiveWins = 0;
          if (isPneu) p.stats.pneusReceived++;
        }
        const opponents = isWinner ? loserIds : winnerIds;
        opponents.forEach(oid => {
          if (!p.rivalries[oid]) p.rivalries[oid] = { winsAgainst: 0, lossesTo: 0 };
          if (isWinner) p.rivalries[oid].winsAgainst++;
          else p.rivalries[oid].lossesTo++;
        });
        if (match.mode === 'DUPLAS') {
          const teammates = isWinner ? winnerIds : loserIds;
          teammates.forEach(tid => {
            if (tid === id) return;
            if (!p.partnerships) p.partnerships = {};
            if (!p.partnerships[tid]) p.partnerships[tid] = { wins: 0, losses: 0 };
            if (isWinner) p.partnerships[tid].wins++;
            else p.partnerships[tid].losses++;
          });
        }
      };

      winnerIds.forEach(id => updatePlayerStats(id, true, isPneu));
      loserIds.forEach(id => updatePlayerStats(id, false, isPneu));

      const others = prev.queue.filter(id => !winnerIds.includes(id) && !loserIds.includes(id));
      const newQueue = [...winnerIds, ...others, ...loserIds];

      let nextActiveMatch = null;
      if (autoStartNext && newQueue.length >= (currentMode === 'SOLO' ? 2 : 4)) {
        nextActiveMatch = {
          id: (Date.now() + 1).toString(),
          mode: currentMode,
          sideA: currentMode === 'SOLO' ? [newQueue[0]] : [newQueue[0], newQueue[1]],
          sideB: currentMode === 'SOLO' ? [newQueue[1]] : [newQueue[2], newQueue[3]],
          scoreA: 0, scoreB: 0, winner: null, timestamp: Date.now(), isDeuce: false,
          maxTrailingA: 0, maxTrailingB: 0
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        queue: newQueue,
        history: [match, ...prev.history].slice(0, 50),
        activeMatch: nextActiveMatch
      };
    });
  };

  const isMatchActive = state.activeMatch !== null && location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      {highlightPlayerId && (
        <HighlightsOverlay 
          playerId={highlightPlayerId} 
          state={state} 
          onClose={() => setHighlightPlayerId(null)} 
        />
      )}

      {!isMatchActive && (
        <header className="bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-[#333]">
          <h1 className="font-arcade text-2xl text-[#4ade80] tracking-tighter">REI DA MESA</h1>
          <div className="flex gap-2">
            {deferredPrompt && (
              <button onClick={installPWA} className="bg-[#4ade80] text-black px-3 py-1 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-1">
                <Download size={12} /> INSTALAR
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${!isMatchActive ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<GameView state={state} updateScore={updateScore} finishMatch={finishMatch} startMatch={startMatch} resetMatch={() => setState(p => ({...p, activeMatch: null}))} />} />
          <Route path="/queue" element={<QueueView state={state} addPlayer={addPlayer} toggleActive={id => {
            setState(prev => {
              const p = prev.players[id];
              const newActive = !p.active;
              let nq = [...prev.queue];
              if (newActive) nq.push(id); else nq = nq.filter(pid => pid !== id);
              return {...prev, queue: nq, players: {...prev.players, [id]: {...p, active: newActive}}};
            })
          }} moveInQueue={(idx, dir) => {
            setState(prev => {
              const nq = [...prev.queue];
              const target = dir === 'up' ? idx-1 : idx+1;
              if (target < 0 || target >= nq.length) return prev;
              [nq[idx], nq[target]] = [nq[target], nq[idx]];
              return {...prev, queue: nq};
            });
          }} shuffleQueue={() => {
            setState(prev => {
              const playing = prev.activeMatch ? [...prev.activeMatch.sideA, ...prev.activeMatch.sideB] : [];
              const waiters = prev.queue.filter(id => !playing.includes(id)).sort(() => Math.random() - 0.5);
              return {...prev, queue: [...playing, ...waiters]};
            });
            playArcadeSound('deuce');
          }} removeFromQueue={id => setState(p => ({...p, queue: p.queue.filter(i => i !== id)}))} updatePlayer={(id, n, l, e) => setState(prev => ({ ...prev, players: { ...prev.players, [id]: { ...prev.players[id], name: n, level: l, emoji: e } } }))} removePlayer={id => setState(prev => { const newP = { ...prev.players }; delete newP[id]; return { ...prev, players: newP, queue: prev.queue.filter(pid => pid !== id) }; })} />} />
          <Route path="/stats" element={<StatsView state={state} onShowHighlights={setHighlightPlayerId} />} />
          <Route path="/settings" element={<SettingsView state={state} setState={setState} installPWA={installPWA} canInstall={!!deferredPrompt} />} />
        </Routes>
      </main>

      {!isMatchActive && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] flex justify-around p-2 z-50">
          <NavLink to="/" icon={<Trophy size={20} />} label="Jogo" />
          <NavLink to="/queue" icon={<ListOrdered size={20} />} label="Fila" />
          <NavLink to="/stats" icon={<Crown size={20} />} label="Mesa" />
          <NavLink to="/settings" icon={<Settings size={20} />} label="Ajustes" />
        </nav>
      )}
    </div>
  );
};

const NavLink = ({ to, icon, label }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-[#4ade80] bg-[#4ade801a]' : 'text-[#737373]'}`}>
      {icon}
      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </Link>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
