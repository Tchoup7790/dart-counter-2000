import type { X01_VARIANTS } from '../enums/x01-variants.enum'
import type { DartThrow } from './dart-throw.interface'

export interface X01Options {
  startingPoints: X01_VARIANTS
  doubleIn: boolean
  doubleOut: boolean
  masterIn: boolean
  masterOut: boolean
}

export interface CurrentRoundX01 {
  teamIndex: number
  playerIndex: number
  scoreSnapshot: number
  dartThrows: DartThrow[]
  isBust: boolean
}

export interface ProcessRoundResultX01 {
  needOpenning: boolean
  bust: boolean
  winner: boolean
}
