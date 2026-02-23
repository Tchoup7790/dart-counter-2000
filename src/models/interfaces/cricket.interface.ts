import type { CrossState } from '../enums/cross-state.enum'

export interface CricketOptions {
  crazy: boolean
  cutThroat: boolean
}

export interface CricketNumberState {
  team: number
  crossState: CrossState
}

export interface CricketSegmentState {
  [segment: number]: CricketNumberState[]
}
