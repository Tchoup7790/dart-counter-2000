import type { CROSS_STATE } from '../enums/cross-state.enum'

export interface CricketOptions {
  crazy: boolean
  cutThroat: boolean
}

export interface CricketNumberState {
  team: number
  crossState: CROSS_STATE
}

export interface CricketSegmentState {
  [segment: number]: CricketNumberState[]
}

export interface CricketRoundResult {
  pointDeltas: { teamIndex: number; delta: number }[]
  winner: number | undefined
}
