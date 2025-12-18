
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
    pneusApplied: number;
    pneusReceived: number;
    soloMatches: number;
    duplasMatches: number;
  };
  rivalries: {
    [playerId: string]: {
      winsAgainst: number;
      lossesTo: number;
    };
  };
  partnerships: {
    [partnerId: string]: {
      wins: number;
      losses: number;
    };
  };
}

export type GameMode = 'SOLO' | 'DUPLAS';

export interface Match {
  id: string;
  mode: GameMode;
  sideA: string[];
  sideB: string[];
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B' | null;
  timestamp: number;
  isDeuce: boolean;
  isComeback?: boolean; // Nova propriedade
  maxTrailingA?: number; // Auxiliar para cálculo de virada
  maxTrailingB?: number; // Auxiliar para cálculo de virada
}

export interface AppState {
  players: Record<string, Player>;
  queue: string[];
  activeMatch: Match | null;
  history: Match[];
}
