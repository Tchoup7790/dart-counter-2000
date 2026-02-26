import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type {
  RoundResult221,
  TwoHundredTwentyOneOptions,
} from '@/models/interfaces/two-hundred-twenty-one.interface'
import { TARGET_221 } from '@/utils/constantes'
import { defineStore } from 'pinia'

export interface TwoHundredTwentyOneState {
  allScores: number[]
  options: TwoHundredTwentyOneOptions
  currentTeamIndex: number | undefined
  currentPlayerIndex: number | undefined
  currentScore: number | undefined
  currentDartThrow: number
  currentValidThrows: DartThrow[]
}

export const use221Store = defineStore('221', {
  state: () =>
    ({
      allScores: [],
      options: {
        doubleOut: false,
      },
      currentTeamIndex: undefined,
      currentPlayerIndex: undefined,
      currentScore: undefined,
      currentDartThrow: 0,
      currentValidThrows: [],
    }) as TwoHundredTwentyOneState,

  actions: {
    // Initialisation du jeu
    init(
      options: TwoHundredTwentyOneOptions,
      teamCount: number,
    ) {
      this.reset()
      this.options = options

      this.allScores = Array.from({ length: teamCount }, () => 0)
    },

    // Initialisation d'un Round
    initRound(
      teamIndex: number,
      playerIndex: number,
      score: number,
    ) {
      this.resetRound()

      // Vérification d'un nouveau joueur / équipe
      if (
        this.currentTeamIndex === teamIndex &&
        this.currentPlayerIndex === playerIndex
      ) {
        throw new Error(
          'initRound: PlayerIndex And TeamIndex already set',
        )
      }

      this.currentTeamIndex = teamIndex
      this.currentPlayerIndex = playerIndex
      this.currentScore = score
    },

    // Processus d'un lancer
    processRound(dart: DartThrow): RoundResult221 {
      this.checkIfPlayerExist()

      if (this.currentDartThrow >= 3) {
        throw new Error(
          'processRound: déjà trois fléchettes de lancées',
        )
      }

      // incrément du nombre de fléchette jouer
      this.currentDartThrow++
      this.currentValidThrows.push(dart)

      const nextScore = this.currentScore! + dart.value

      // Vérification d'un bust
      // * score supérieur à la TARGET
      // * score à 1 alors que besoin d'un double
      if (
        nextScore > TARGET_221 ||
        (nextScore === 1 && this.options.doubleOut)
      ) {
        return {
          validThrows: this.currentValidThrows,
          bust: true,
          resetToZero: [],
          winner: false,
          pointsToAdd: 0,
        }
      }

      // Vérification de la Victoire
      // * score === TARGET
      // * cf. Vérification Bust
      if (
        nextScore === TARGET_221 &&
        this.isValidClosingDart(dart)
      ) {
        return {
          validThrows: this.currentValidThrows,
          bust: false,
          resetToZero: [],
          winner: true,
          pointsToAdd: this.currentScore! + nextScore,
        }
      }

      // MÀJ du score
      this.currentScore = nextScore
      this.allScores[this.currentTeamIndex!] = this.currentScore

      return {
        validThrows: this.currentValidThrows,
        resetToZero: this.resetToZeroAndGiveIndexs(),
        bust: false,
        winner: false,
        pointsToAdd: this.currentScore,
      }
    },

    // Check d'un score identique pour revenir à 0
    resetToZeroAndGiveIndexs(): number[] {
      return this.allScores.map((value, index) => {
        if (
          index !== this.currentTeamIndex &&
          value === this.currentScore
        ) {
          return 0
        }
        return value ?? 0
      })
    },

    // annuler le dernier le lancer
    cancelThrow(bust: boolean): RoundResult221 {
      // annuler la remise à 0
      this.allScores = this.allScores.map((value, index) => {
        if (index !== this.currentTeamIndex && value === 0) {
          return this.currentScore ?? 0
        }
        return value ?? 0
      })

      if (!bust) {
        this.currentScore! -=
          this.currentValidThrows[
            this.currentDartThrow! - 1
          ]!.value
      }

      this.currentDartThrow--
      this.currentValidThrows.pop()

      return {
        validThrows: this.currentValidThrows,
        bust: false,
        resetToZero: [],
        winner: false,
        pointsToAdd: this.currentScore ?? 0,
      }
    },

    // Check si l'index de joueur existe
    checkIfPlayerExist() {
      if (
        !this.currentTeamIndex === undefined ||
        !this.currentPlayerIndex === undefined ||
        !this.currentScore === undefined
      ) {
        throw new Error('processRound: Team or Player not Setup')
      }
    },

    // Vérification de si le lancer est valid pour la fermeture
    isValidClosingDart(dart: DartThrow): boolean {
      if (this.options.doubleOut) {
        return dart.multiplier === 2 || dart.sector === 50
      } else {
        return true
      }
    },

    // reset du state
    reset() {
      this.allScores = []
      this.options = {
        doubleOut: false,
      }
      this.resetRound()
    },

    // reset round
    resetRound() {
      this.currentTeamIndex = undefined
      this.currentPlayerIndex = undefined
      this.currentScore = undefined
      this.currentDartThrow = 0
      this.currentValidThrows = []
    },
  },
})
