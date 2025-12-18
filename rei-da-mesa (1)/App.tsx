
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Trophy, ListOrdered, Settings, Zap, Crown, Download } from 'lucide-react';
import { Player, Match, AppState, GameMode } from './types';
import { INITIAL_PLAYERS } from './constants';
import { playArcadeSound } from './audio';

// --- Views ---
import GameView from './views/GameView';
import QueueView from './views/QueueView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('rei-da-mesa-v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed.players).forEach(id => {
        const p = parsed.players[id];
        if (p.active === undefined) p.active = parsed.queue.includes(id);
        if (p.stats.pneusApplied === undefined) p.stats.pneusApplied = 0;
        if (p.stats.pneusReceived === undefined) p.stats.pneusReceived = 0;
        if (p.stats.losses === undefined) p.stats.losses = p.stats.matches - p.stats.wins;
      });
      return parsed;
    }
    return {
      players: INITIAL_PLAYERS,
      queue: Object.keys(INITIAL_PLAYERS),
      activeMatch: null,
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('rei-da-mesa-v1', JSON.stringify(state));
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
      stats: { matches: 0, wins: 0, losses: 0, pointsScored: 0, consecutiveWins: 0, maxConsecutiveWins: 0, pneusApplied: 0, pneusReceived: 0 },
      rivalries: {}
    };
    setState(prev => ({
      ...prev,
      players: { ...prev.players, [id]: newPlayer },
      queue: [...prev.queue, id]
    }));
  };

  const togglePlayerActive = (id: string) => {
    setState(prev => {
      const p = prev.players[id];
      if (!p) return prev;
      const newActive = !p.active;
      let newQueue = [...prev.queue];
      if (newActive && !newQueue.includes(id)) newQueue.push(id);
      else if (!newActive) newQueue = newQueue.filter(pid => pid !== id);
      return { ...prev, players: { ...prev.players, [id]: { ...p, active: newActive } }, queue: newQueue };
    });
  };

  const moveInQueue = (index: number, direction: 'up' | 'down') => {
    setState(prev => {
      const newQueue = [...prev.queue];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newQueue.length) return prev;
      [newQueue[index], newQueue[targetIndex]] = [newQueue[targetIndex], newQueue[index]];
      return { ...prev, queue: newQueue };
    });
  };

  const removeFromQueue = (id: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter(pid => pid !== id),
      players: { ...prev.players, [id]: { ...prev.players[id], active: false } }
    }));
  };

  const shuffleQueue = () => {
    setState(prev => {
      const playingIds = prev.activeMatch ? [...prev.activeMatch.sideA, ...prev.activeMatch.sideB] : [];
      const waiters = prev.queue.filter(id => !playingIds.includes(id));
      const shuffled = [...waiters].sort(() => Math.random() - 0.5);
      return { ...prev, queue: [...playingIds, ...shuffled] };
    });
    playArcadeSound('deuce');
  };

  const startMatch = (mode: GameMode) => {
    if (state.queue.length < (mode === 'SOLO' ? 2 : 4)) return;
    const sideA = mode === 'SOLO' ? [state.queue[0]] : [state.queue[0], state.queue[1]];
    const sideB = mode === 'SOLO' ? [state.queue[1]] : [state.queue[2], state.queue[3]];
    setState(prev => ({
      ...prev,
      activeMatch: {
        id: Date.now().toString(),
        mode, sideA, sideB, scoreA: 0, scoreB: 0, winner: null, timestamp: Date.now(), isDeuce: false
      }
    }));
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
      if (match.winner && !oldWinner) playArcadeSound('victory');
      return { ...prev, activeMatch: match };
    });
  };

  const finishMatch = () => {
    if (!state.activeMatch || !state.activeMatch.winner) return;
    setState(prev => {
      const match = prev.activeMatch!;
      const isWinnerA = match.winner === 'A';
      const winnerIds = isWinnerA ? match.sideA : match.sideB;
      const loserIds = isWinnerA ? match.sideB : match.sideA;
      const winnerScore = isWinnerA ? match.scoreA : match.scoreB;
      const loserScore = isWinnerA ? match.scoreB : match.scoreA;
      const isPneu = winnerScore === 5 && loserScore === 0;

      const updatedPlayers = { ...prev.players };

      // Atualiza Vencedores
      winnerIds.forEach(pid => {
        const p = updatedPlayers[pid];
        if (p) {
          p.stats.matches++;
          p.stats.wins++;
          p.stats.pointsScored += winnerScore;
          p.stats.consecutiveWins++;
          p.stats.maxConsecutiveWins = Math.max(p.stats.maxConsecutiveWins, p.stats.consecutiveWins);
          if (isPneu) p.stats.pneusApplied++;
          
          // Rivalidades
          loserIds.forEach(lpid => {
            if (!p.rivalries[lpid]) p.rivalries[lpid] = { winsAgainst: 0, lossesTo: 0 };
            p.rivalries[lpid].winsAgainst++;
          });
        }
      });

      // Atualiza Perdedores
      loserIds.forEach(pid => {
        const p = updatedPlayers[pid];
        if (p) {
          p.stats.matches++;
          p.stats.losses++;
          p.stats.pointsScored += loserScore;
          p.stats.consecutiveWins = 0;
          if (isPneu) p.stats.pneusReceived++;

          // Rivalidades
          winnerIds.forEach(wpid => {
            if (!p.rivalries[wpid]) p.rivalries[wpid] = { winsAgainst: 0, lossesTo: 0 };
            p.rivalries[wpid].lossesTo++;
          });
        }
      });

      const others = prev.queue.filter(id => !winnerIds.includes(id) && !loserIds.includes(id));
      const newQueue = [...winnerIds, ...others, ...loserIds];

      return {
        ...prev,
        players: updatedPlayers,
        queue: newQueue,
        history: [match, ...prev.history].slice(0, 50),
        activeMatch: null
      };
    });
  };

  const resetMatch = () => setState(prev => ({ ...prev, activeMatch: null }));
  const isMatchActive = state.activeMatch !== null && location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
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
          <Route path="/" element={<GameView state={state} updateScore={updateScore} finishMatch={finishMatch} startMatch={startMatch} resetMatch={resetMatch} />} />
          <Route path="/queue" element={<QueueView state={state} addPlayer={addPlayer} toggleActive={togglePlayerActive} moveInQueue={moveInQueue} shuffleQueue={shuffleQueue} removeFromQueue={removeFromQueue} updatePlayer={(id, n, l, e) => setState(prev => ({ ...prev, players: { ...prev.players, [id]: { ...prev.players[id], name: n, level: l, emoji: e } } }))} removePlayer={id => setState(prev => { const newP = { ...prev.players }; delete newP[id]; return { ...prev, players: newP, queue: prev.queue.filter(pid => pid !== id) }; })} />} />
          <Route path="/stats" element={<StatsView state={state} />} />
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
