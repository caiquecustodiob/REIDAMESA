
import { Player } from './types';

export const EMOJIS = ['🏓', '🔥', '👑', '⚡', '🤖', 'REX', '🦁', '🦍', '🐼', '🦊', '🐱', '🐶', '🍕', '🌮', '🎮', '⚽', '🏀', '🎾'];

export const COLORS = {
  bg: '#0a0a0a',
  surface: '#1a1a1a',
  primary: '#4ade80', // Ping pong green
  secondary: '#eab308', // Gold
  accent: '#ef4444', // Red
  muted: '#737373'
};

export const LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Pro'];

const emptyStats = {
  matches: 0,
  wins: 0,
  losses: 0,
  pointsScored: 0,
  consecutiveWins: 0,
  maxConsecutiveWins: 0,
  pneusApplied: 0,
  pneusReceived: 0
};

export const INITIAL_PLAYERS: Record<string, Player> = {
  'p1': { id: 'p1', name: 'Caique', emoji: '🏓', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p2': { id: 'p2', name: 'Lucas', emoji: '🔥', level: 'Iniciante', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p3': { id: 'p3', name: 'Emanuel', emoji: '⚡', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p4': { id: 'p4', name: 'Rian', emoji: '🦖', level: 'Avançado', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p5': { id: 'p5', name: 'Gustavo', emoji: '🦁', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p6': { id: 'p6', name: 'Jorge', emoji: '🦍', level: 'Iniciante', active: true, stats: { ...emptyStats }, rivalries: {} },
  'p7': { id: 'p7', name: 'Ricardo', emoji: '🦊', level: 'Pro', active: true, stats: { ...emptyStats }, rivalries: {} },
};
