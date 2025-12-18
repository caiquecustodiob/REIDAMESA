
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Trophy, Users, ListOrdered, Settings, Play, Plus, Minus, UserPlus, Info, Zap, Crown, Swords, Ghost, Smile } from 'lucide-react';
import { Player, Match, AppState, GameMode } from './types';
import { EMOJIS, LEVELS, INITIAL_PLAYERS } from './constants';
import { playArcadeSound } from './audio';

// --- Views ---
import GameView from './views/GameView';
import QueueView from './views/QueueView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';

const AppContent: React.FC = () => {
  const location = useLocation();
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
        [id]: {
          ...prev.players[id],
          name,
          level,
          emoji
        }
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

    let sideA: string[] = [];
    let sideB: string[] = [];

    if (mode === 'SOLO') {
      sideA = [state.queue[0]];
      sideB = [state.queue[1]];
    } else {
      sideA = [state.queue[0], state.queue[1]];
      sideB = [state.queue[2], state.queue[3]];
    }

    const newMatch: Match = {
      id: Date.now().toString(),
      mode,
      sideA,
      sideB,
      scoreA: 0,
      scoreB: 0,
      winner: null,
      timestamp: Date.now(),
      isDeuce: false
    };

    setState(prev => ({
      ...prev,
      activeMatch: newMatch
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

      // --- LÓGICA DE JOGO NORMAL ---
      if (!match.isDeuce) {
        // Regra do Pneu (5-0 ou 0-5)
        if (match.scoreA === 5 && match.scoreB === 0) {
            match.winner = 'A';
        } else if (match.scoreB === 5 && match.scoreA === 0) {
            match.winner = 'B';
        }
        // Vitória Normal
        else if (match.scoreA >= limit) {
            match.winner = 'A';
        } else if (match.scoreB >= limit) {
            match.winner = 'B';
        }
        // Gatilho de Desempate (Deuce)
        else if (match.scoreA === deuceTrigger && match.scoreB === deuceTrigger) {
            match.isDeuce = true;
            match.scoreA = 0;
            match.scoreB = 0;
            playArcadeSound('deuce');
        }
      } 
      // --- LÓGICA DE DESEMPATE (DEUCE) ---
      else {
        // Regra do Reset em 1-1
        if (match.scoreA === 1 && match.scoreB === 1) {
            match.scoreA = 0;
            match.scoreB = 0;
            playArcadeSound('remove'); // Som de frustração/reset
        } 
        // Vitória por 2 pontos de diferença (2-0 ou 0-2)
        else if (match.scoreA >= 2) {
            match.winner = 'A';
        } else if (match.scoreB >= 2) {
            match.winner = 'B';
        }
      }

      if (match.winner && !oldWinner) {
        playArcadeSound('victory');
      }

      return { ...prev, activeMatch: match };
    });
  };

  const finishMatch = () => {
    if (!state.activeMatch || !state.activeMatch.winner) return;

    setState(prev => {
      const match = prev.activeMatch!;
      const mode = match.mode;
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
        p.stats.pointsScored += match.winner === 'A' ? match.scoreA : match.scoreB;
        
        loserSide.forEach(lpid => {
          if (!p.rivalries[lpid]) p.rivalries[lpid] = { winsAgainst: 0, lossesTo: 0 };
          p.rivalries[lpid].winsAgainst++;
        });
      });

      loserSide.forEach(pid => {
        const p = updatedPlayers[pid];
        if (!p) return;
        p.stats.matches++;
        p.stats.losses++;
        p.stats.consecutiveWins = 0;
        p.stats.pointsScored += match.winner === 'B' ? match.scoreA : match.scoreB;

        winnerSide.forEach(wpid => {
          if (!p.rivalries[wpid]) p.rivalries[wpid] = { winsAgainst: 0, lossesTo: 0 };
          p.rivalries[wpid].lossesTo++;
        });
      });

      const remainingQueue = prev.queue.filter(id => !winnerSide.includes(id) && !loserSide.includes(id));
      const newQueue = [...winnerSide, ...remainingQueue, ...loserSide];

      let nextMatch: Match | null = null;
      if (newQueue.length >= (mode === 'SOLO' ? 2 : 4)) {
        nextMatch = {
          id: (Date.now() + 1).toString(),
          mode,
          sideA: mode === 'SOLO' ? [newQueue[0]] : [newQueue[0], newQueue[1]],
          sideB: mode === 'SOLO' ? [newQueue[1]] : [newQueue[2], newQueue[3]],
          scoreA: 0,
          scoreB: 0,
          winner: null,
          timestamp: Date.now(),
          isDeuce: false
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        queue: newQueue,
        history: [match, ...prev.history].slice(0, 100),
        activeMatch: nextMatch
      };
    });
  };

  const resetMatch = () => {
    setState(prev => ({ ...prev, activeMatch: null }));
  };

  const isMatchActive = state.activeMatch !== null && location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isMatchActive && (
        <header className="bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-[#333]">
          <h1 className="font-arcade text-2xl text-[#4ade80] tracking-tighter">REI DA MESA</h1>
          <div className="flex gap-4">
            <span className="text-xs bg-[#4ade80] text-black font-bold px-2 py-1 rounded">BETA</span>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${!isMatchActive ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<GameView state={state} updateScore={updateScore} finishMatch={finishMatch} startMatch={startMatch} resetMatch={resetMatch} />} />
          <Route path="/queue" element={<QueueView state={state} addPlayer={addPlayer} updatePlayer={updatePlayer} removePlayer={removePlayer} />} />
          <Route path="/stats" element={<StatsView state={state} />} />
          <Route path="/settings" element={<SettingsView state={state} setState={setState} />} />
        </Routes>
      </main>

      {!isMatchActive && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] flex justify-around p-2 z-50">
          <NavLink to="/" icon={<Trophy size={20} />} label="Jogo" />
          <NavLink to="/queue" icon={<ListOrdered size={20} />} label="Fila" />
          <NavLink to="/stats" icon={<Users size={20} />} label="Mesa" />
          <NavLink to="/settings" icon={<Settings size={20} />} label="Ajustes" />
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

const NavLink = ({ to, icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive ? 'text-[#4ade80] bg-[#4ade801a]' : 'text-[#737373]'}`}>
      {icon}
      <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{label}</span>
    </Link>
  );
};

export default App;
