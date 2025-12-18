
import { Player } from './types';

// Updated EMOJIS list to include the actual dinosaur emoji instead of a string 'REX'
export const EMOJIS = ['🏓', '🔥', '👑', '⚡', '🤖', '🦖', '🦁', '🦍', '🐼', '🦊', '🐱', '🐶', '🍕', '🌮', '🎮', '⚽', '🏀', '🎾'];

export const COLORS = {
  bg: '#0a0a0a',
  surface: '#1a1a1a',
  primary: '#4ade80', // Ping pong green
  secondary: '#eab308', // Gold
  accent: '#ef4444', // Red
  muted: '#737373'
};

export const LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Pro'];

// Added soloMatches and duplasMatches to satisfy Player.stats interface
const emptyStats = {
  matches: 0,
  wins: 0,
  losses: 0,
  pointsScored: 0,
  consecutiveWins: 0,
  maxConsecutiveWins: 0,
  pneusApplied: 0,
  pneusReceived: 0,
  soloMatches: 0,
  duplasMatches: 0
};

// Added partnerships: {} to each initial player to satisfy the Player interface requirements
export const INITIAL_PLAYERS: Record<string, Player> = {
  'p1': { id: 'p1', name: 'Caique', emoji: '🏓', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p2': { id: 'p2', name: 'Lucas', emoji: '🔥', level: 'Iniciante', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p3': { id: 'p3', name: 'Emanuel', emoji: '⚡', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p4': { id: 'p4', name: 'Rian', emoji: '🦖', level: 'Avançado', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p5': { id: 'p5', name: 'Gustavo', emoji: '🦁', level: 'Intermediário', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p6': { id: 'p6', name: 'Jorge', emoji: '🦍', level: 'Iniciante', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
  'p7': { id: 'p7', name: 'Ricardo', emoji: '🦊', level: 'Pro', active: true, stats: { ...emptyStats }, rivalries: {}, partnerships: {} },
};
