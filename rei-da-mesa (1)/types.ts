
export type Level = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Pro';

export interface Player {
  id: string;
  name: string;
  emoji: string;
  level: Level;
  stats: {
    matches: number;
    wins: number;
    losses: number;
    pointsScored: number;
    consecutiveWins: number;
    maxConsecutiveWins: number;
  };
  rivalries: {
    [playerId: string]: {
      winsAgainst: number;
      lossesTo: number;
    };
  };
}

export type GameMode = 'SOLO' | 'DUPLAS';

export interface Match {
  id: string;
  mode: GameMode;
  sideA: string[]; // Player IDs
  sideB: string[]; // Player IDs
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B' | null;
  timestamp: number;
  isDeuce: boolean;
}

export interface AppState {
  players: Record<string, Player>;
  queue: string[]; // Array of player IDs
  activeMatch: Match | null;
  history: Match[];
}
