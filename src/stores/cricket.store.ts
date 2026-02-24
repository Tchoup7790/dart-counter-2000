import type {
  CricketOptions,
  RoundResultCricket,
} from '@/models/interfaces/cricket.interface'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import { defineStore } from 'pinia'

const DEFAULT_CRICKET_VARIANTS = [15, 16, 17, 18, 19, 20, 25]

export interface CricketState {
  cricketBoard: number[][]
  cricketTarget: number[]
  options: CricketOptions
  currentTeamIndex: number | undefined
  currentPlayerIndex: number | undefined
  currentScore: number | undefined
  currentDartThrow: number
  currentValidThrows: DartThrow[]
}

export const useCricketStore = defineStore('Cricket', {
  state: () =>
    ({
      cricketBoard: [],
      cricketTarget: [],
      options: {
        crazy: false,
        cutThroat: false,
      },
      currentTeamIndex: undefined,
      currentPlayerIndex: undefined,
      currentScore: undefined,
      currentDartThrow: 0,
      currentValidThrows: [],
    }) as CricketState,

  actions: {
    // Initialisation du jeu
    init(options: CricketOptions, teamCount: number) {
      this.reset()
      this.options = options

      for (let i = 0; i < teamCount; i++) {
        this.cricketBoard[i] = Array.from(
          { length: DEFAULT_CRICKET_VARIANTS.length },
          () => 0,
        )
      }

      if (this.options.crazy) {
        const pool = [
          ...Array.from({ length: 20 }, (_, i) => i + 1),
          25,
        ]
        this.cricketTarget = pool
          .sort(() => Math.random() - 0.5)
          .slice(0, 7)
          .sort((a, b) => a - b)
      } else {
        this.cricketTarget = DEFAULT_CRICKET_VARIANTS
      }
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
      this.currentScore = this.options.cutThroat ? 0 : score
    },

    // Processus d'un lancer
    processRound(dart: DartThrow): RoundResultCricket {
      this.checkIfPlayerExist()

      // incrément du nombre de fléchette jouer
      this.currentDartThrow++

      if (this.currentDartThrow >= 3) {
        throw new Error(
          'processRound: déjà trois fléchettes de lancées',
        )
      }

      const dartValue = this.getDartValue(dart)
      this.currentValidThrows.push(dart)

      if (dartValue > 0) {
        this.addDartToBoard(dartValue)
      }

      // Vérification de l'arrêt
      // * tous les élements du tableau de l'équipe est à 3
      if (this.checkIfBoardComplete()) {
        return {
          validThrows: this.currentValidThrows,
          winner: true,
          pointsToAdd: 0,
        }
      }

      return {
        validThrows: this.currentValidThrows,
        winner: false,
        pointsToAdd: this.currentScore!,
      }
    },

    // vérification de si un board est complément fermé
    checkIfBoardComplete(): boolean {
      return this.cricketBoard[this.currentTeamIndex!]!.every(
        (elt) => elt >= 3,
      )
    },

    // ajout de la valeur au cricketBoard
    addDartToBoard(value: number) {
      const valueIndex = this.cricketTarget.findIndex(
        (elt) => elt === value,
      )

      if (
        this.cricketBoard[this.currentTeamIndex!]![valueIndex]! <
        3
      ) {
        this.cricketBoard[this.currentTeamIndex!]![valueIndex]!++
      } else {
        this.currentScore = this.options.cutThroat
          ? this.currentScore! + value
          : value
      }
    },

    // recupération du prochain score
    getDartValue(dart: DartThrow): number {
      const dartValue = dart.value === 50 ? 25 : dart.value
      if (this.cricketTarget.includes(dartValue)) {
        return dart.value
      } else {
        return 0
      }
    },

    // annuler le dernier le lancer
    cancelThrow(): RoundResultCricket {
      const value =
        this.currentValidThrows[
          this.currentValidThrows.length - 1
        ]!.value

      const valueIndex = this.cricketTarget.findIndex(
        (elt) => elt === value,
      )
      this.cricketBoard[this.currentTeamIndex!]![valueIndex]!--

      this.currentDartThrow--
      this.currentValidThrows.pop()

      return {
        validThrows: this.currentValidThrows,
        winner: false,
        pointsToAdd: this.currentScore ?? 0,
      }
    },

    // Check si l'index de joueur existe
    checkIfPlayerExist() {
      if (
        !this.currentTeamIndex === undefined ||
        !this.currentPlayerIndex === undefined ||
        !this.currentScore === undefined ||
        !this.cricketBoard[this.currentTeamIndex!] ||
        this.cricketBoard[this.currentTeamIndex!]!.length <= 0
      ) {
        throw new Error('processRound: Team or Player not Setup')
      }
    },

    // reset du state
    reset() {
      this.cricketBoard = []
      this.cricketTarget = []
      this.options = {
        crazy: false,
        cutThroat: false,
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
