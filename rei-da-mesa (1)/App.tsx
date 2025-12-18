
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
    if (saved) return JSON.parse(saved);
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

  // Captura o evento de instalação do PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('REI DA MESA: Pronto para instalar!');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const addPlayer = (name: string, level: any, emoji: string) => {
    const id = Date.now().toString();
    const newPlayer: Player = {
      id,
      name,
      emoji,
      level,
      stats: { matches: 0, wins: 0, losses: 0, pointsScored: 0, consecutiveWins: 0, maxConsecutiveWins: 0 },
      rivalries: {}
    };
    setState(prev => ({
      ...prev,
      players: { ...prev.players, [id]: newPlayer },
      queue: [...prev.queue, id]
    }));
  };

  const updatePlayer = (id: string, name: string, level: any, emoji: string) => {
    setState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [id]: { ...prev.players[id], name, level, emoji }
      }
    }));
  };

  const removePlayer = (id: string) => {
    setState(prev => {
      const newPlayers = { ...prev.players };
      delete newPlayers[id];
      return {
        ...prev,
        players: newPlayers,
        queue: prev.queue.filter(pid => pid !== id)
      };
    });
  };

  const startMatch = (mode: GameMode) => {
    if (state.queue.length < (mode === 'SOLO' ? 2 : 4)) return;
    const sideA = mode === 'SOLO' ? [state.queue[0]] : [state.queue[0], state.queue[1]];
    const sideB = mode === 'SOLO' ? [state.queue[1]] : [state.queue[2], state.queue[3]];
    
    setState(prev => ({
      ...prev,
      activeMatch: {
        id: Date.now().toString(),
        mode,
        sideA,
        sideB,
        scoreA: 0,
        scoreB: 0,
        winner: null,
        timestamp: Date.now(),
        isDeuce: false
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
          match.isDeuce = true;
          match.scoreA = 0;
          match.scoreB = 0;
          playArcadeSound('deuce');
        }
      } else {
        if (match.scoreA === 1 && match.scoreB === 1) {
          match.scoreA = 0;
          match.scoreB = 0;
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
      const winnerSide = match.winner === 'A' ? match.sideA : match.sideB;
      const loserSide = match.winner === 'A' ? match.sideB : match.sideA;
      const updatedPlayers = { ...prev.players };

      winnerSide.forEach(pid => {
        const p = updatedPlayers[pid];
        if (!p) return;
        p.stats.matches++;
        p.stats.wins++;
        p.stats.consecutiveWins++;
        p.stats.maxConsecutiveWins = Math.max(p.stats.maxConsecutiveWins, p.stats.consecutiveWins);
      });

      loserSide.forEach(pid => {
        const p = updatedPlayers[pid];
        if (!p) return;
        p.stats.matches++;
        p.stats.losses++;
        p.stats.consecutiveWins = 0;
      });

      const remainingQueue = prev.queue.filter(id => !winnerSide.includes(id) && !loserSide.includes(id));
      const newQueue = [...winnerSide, ...remainingQueue, ...loserSide];

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
              <button onClick={installPWA} className="bg-[#4ade80] text-black px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                <Download size={12} /> INSTALAR
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${!isMatchActive ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<GameView state={state} updateScore={updateScore} finishMatch={finishMatch} startMatch={startMatch} resetMatch={resetMatch} />} />
          <Route path="/queue" element={<QueueView state={state} addPlayer={addPlayer} updatePlayer={updatePlayer} removePlayer={removePlayer} />} />
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
    <Link to={to} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
      {icon}
      <span className="text-[10px] font-bold mt-1 uppercase">{label}</span>
    </Link>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
