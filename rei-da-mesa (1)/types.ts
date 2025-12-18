
export type Level = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Pro';

export interface Player {
  id: string;
  name: string;
  emoji: string;
  level: Level;
  active: boolean;
  stats: {
    matches: number;
    wins: number;
    losses: number;
    pointsScored: number;
    consecutiveWins: number;
    maxConsecutiveWins: number;
    pneusApplied: number; // Vitórias por 5-0
    pneusReceived: number; // Derrotas por 5-0
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
  queue: string[]; // IDs dos jogadores ativos na fila
  activeMatch: Match | null;
  history: Match[];
}
