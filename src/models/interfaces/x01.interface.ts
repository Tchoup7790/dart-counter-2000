import type { X01_VARIANTS } from '../enums/x01-variants.enum'

export interface X01Options {
  startingPoints: X01_VARIANTS
  doubleIn: boolean
  doubleOut: boolean
  masterIn: boolean
  masterOut: boolean
}
