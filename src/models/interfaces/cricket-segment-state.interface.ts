import type { CricketNumberState } from './cricket-number-state.interface'

export interface CricketSegmentState {
  [segment: number]: CricketNumberState[]
}
