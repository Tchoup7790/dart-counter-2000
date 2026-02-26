import { GameMode } from '@/models/enums/game-mode.enum'
import { X01_VARIANTS } from '@/models/enums/x01-variants.enum'
import { getId } from './functions'

// DartBoard
export const BOARD_SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9,
  12, 5,
]

export const BOARD_GRID = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
]

// Palettes
export const TEAM_COLORS = [
  'var(--cs-yellow)',
  'var(--cs-cyan)',
  'var(--cs-violet)',
  'var(--cs-rose)',
  'var(--cs-orange)',
  'var(--cs-green)',
  'var(--cs-red)',
  'var(--cs-blue)',
  'var(--cs-pink)',
  'var(--cs-lime)',
  'var(--cs-teal)',
  'var(--cs-amber)',
]

export const PLAYER_COLORS = [
  'var(--cs-yellow)',
  'var(--cs-cyan)',
  'var(--cs-violet)',
  'var(--cs-rose)',
  'var(--cs-orange)',
  'var(--cs-green)',
  'var(--cs-red)',
  'var(--cs-blue)',
  'var(--cs-pink)',
  'var(--cs-lime)',
  'var(--cs-teal)',
  'var(--cs-amber)',
]

// Default team / players
export const DEFAULT_SOLO_PLAYERS = [
  { id: getId(), name: 'Joueur 1', color: PLAYER_COLORS[0]! },
  { id: getId(), name: 'Joueur 2', color: PLAYER_COLORS[1]! },
]

export const DEFAULT_TEAM_PLAYERS = [
  {
    id: getId(),
    name: 'Équipe 1',
    color: TEAM_COLORS[0]!,
    score: 0,
    players: [{ id: getId(), name: 'Joueur 1' }],
  },
  {
    id: getId(),
    name: 'Équipe 2',
    color: TEAM_COLORS[1]!,
    score: 0,
    players: [{ id: getId(), name: 'Joueur 1' }],
  },
]

// mode
export const MODE_LABEL: Record<GameMode, string> = {
  [GameMode.X01]: 'X01',
  [GameMode.TWO_HUNDRED_TWENTY_ONE]: '221',
  [GameMode.CRICKET]: 'Cricket',
  [GameMode.ATC]: 'Around the Clock',
}

export const MODE_COLOR: Record<GameMode, string> = {
  [GameMode.X01]: 'var(--cs-green)',
  [GameMode.TWO_HUNDRED_TWENTY_ONE]: 'var(--cs-yellow)',
  [GameMode.CRICKET]: 'var(--cs-red)',
  [GameMode.ATC]: 'var(--cs-cyan)',
}

// Specific Mode
export const X01_ALL_VARIANTS = [
  X01_VARIANTS.X301,
  X01_VARIANTS.X501,
  X01_VARIANTS.X701,
  X01_VARIANTS.X1001,
]

export const TARGET_221 = 221

export const DEFAULT_CRICKET_VARIANTS = [
  15, 16, 17, 18, 19, 20, 25,
]

export const ATC_SEQUENCE = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 25,
]
