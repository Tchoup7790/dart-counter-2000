import { X01_VARIANTS } from '@/models/enums/x01-variants.enum'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type { Team } from '@/models/interfaces/player.interface'
import type { Round } from '@/models/interfaces/round.interface'
import type {
  CurrentRoundX01,
  ProcessRoundResultX01,
  X01Options,
} from '@/models/interfaces/x01.interface'
import { defineStore } from 'pinia'

export interface X01State {
  options: X01Options
  current: CurrentRoundX01
  hasStarted: Record<string, boolean>
  teams: Team[]
  gameHistory: Round[]
}

export const useX01Store = defineStore('X01', {
  state: () =>
    ({
      options: {
        startingPoints: X01_VARIANTS.X301,
        doubleIn: false,
        doubleOut: false,
        masterIn: false,
        masterOut: false,
      },
      current: {
        teamIndex: 0,
        playerIndex: 0,
        scoreSnapshot: 0,
        dartThrows: [],
        isBust: false,
      },
      hasStarted: {},
      teams: [],
      gameHistory: [],
    }) as X01State,

  getters: {
    // Renvoie l'index de la dernière équipe
    lastTeamIndex(): number {
      return this.teams.length - 1
    },
    // Renvoie l'index du dernier joueur de la dernière équipe
    lastPlayerIndex(): number {
      return this.teams[this.lastTeamIndex]!.players.length - 1
    },
    // Renvoie l'équipe en train de jouer
    currentTeam(): Team {
      return this.teams[this.current.teamIndex]!
    },
    // Donnes les points fait pendant le tour
    delta(): number {
      return this.current.dartThrows.reduce(
        (s, dart: DartThrow) => s + dart.value,
        0,
      )
    },
    // Renvoie le score avec le Round en cours
    currentScore(): number {
      return this.currentTeam.score - this.delta
    },
    // Renvoie les couleurs des équipes
    teamColors(): string[] {
      return this.teams.map((team) => team.color)
    },
    // Renvoie les noms des équipes
    teamNames(): string[] {
      return this.teams.map((team) => team.name)
    },
    // Donnes le nombre de round joué
    roundNumber(): number {
      return (
        Math.floor(this.gameHistory.length / this.teams.length) +
        1
      )
    },
  },

  actions: {
    // Initialisation du jeu
    init(options: X01Options, teams: Team[]) {
      // Il y a au moins un joueur
      if (teams.length < 1)
        throw new Error('init: teams.length < 1.')

      // Chaque équipe a au moins un joueur
      teams.forEach((team, i) => {
        if (team.players.length < 1)
          throw new Error(`init: team[${i}] has no players`)
      })

      // Les ids sont uniques (évite les collisions dans hasStarted)
      const ids = teams.map((t) => t.id)
      if (new Set(ids).size !== ids.length)
        throw new Error('init: duplicate team ids')

      this.reset()
      this.options = options
      this.teams = teams

      const needsIn: boolean =
        this.options.doubleIn || this.options.masterIn

      teams.forEach((team) => {
        // Remplissage du tableau de démarrage
        this.hasStarted[team.id] = !needsIn
      })
    },

    // Initialisation d'un Round
    initRound() {
      // Le store a bien été initialisé
      if (this.teams.length < 1)
        throw new Error('initRound: call init() first')

      // L'équipe courante existe encore
      if (!this.teams[this.current.teamIndex])
        throw new Error('initRound: team not found')

      // Le joueur courant existe dans l'équipe
      const currentTeam = this.teams[this.current.teamIndex]!
      if (!currentTeam.players[this.current.playerIndex])
        throw new Error(
          'initRound: player not found in current team',
        )

      if (this.gameHistory.length !== 0) {
        // Passage à l'équipe suivante
        if (this.current.teamIndex >= this.lastTeamIndex) {
          // On revient à la première équipe
          this.current.teamIndex = 0
        } else {
          // Équipe suivante
          this.current.teamIndex++
        }

        // Le joueur dépend du round
        this.current.playerIndex =
          this.roundNumber % this.currentTeam.players.length
      } else {
        this.current.playerIndex = 0
        this.current.teamIndex = 0
      }

      this.current.scoreSnapshot = this.currentTeam!.score ?? 0
      this.current.dartThrows = []
    },

    // Processus d'un lancer
    processRound(dart: DartThrow): ProcessRoundResultX01 {
      // Round initialisé
      if (this.current.dartThrows === undefined)
        throw new Error('processRound: call initRound() first')

      // Round terminé
      if (this.current.dartThrows.length >= 3)
        throw new Error('processRound: already 3 darts thrown')

      // L'équipe courante existe
      if (!this.currentTeam)
        throw new Error('processRound: currentTeam not found')

      // Ajout de la fléchette jouée
      this.current.dartThrows.push(dart)

      // Vérification de l'ouverture du jeu
      if (!this.checkIfPlayerCanPlay(dart)) {
        return {
          needOpenning: true,
          bust: false,
          winner: false,
        }
      }

      // Vérification d'un bust
      if (this.isBust(dart)) {
        this.current.isBust = true

        while (this.current.dartThrows.length < 3) {
          this.current.dartThrows.push({
            sector: 0,
            multiplier: 1,
            value: 0,
          })
        }

        return {
          needOpenning: false,
          bust: true,
          winner: false,
        }
      }

      // Vérification de la Victoire
      if (this.currentScore === 0) {
        while (this.current.dartThrows.length < 3) {
          this.current.dartThrows.push({
            sector: 0,
            multiplier: 1,
            value: 0,
          })
        }

        return {
          needOpenning: false,
          bust: false,
          winner: true,
        }
      }

      return {
        needOpenning: false,
        bust: false,
        winner: false,
      }
    },

    // Check si le joueur à réussi son démarrage
    checkIfPlayerCanPlay(dart: DartThrow): boolean {
      // Si le joueur peut déjà jouer
      if (this.hasStarted[this.currentTeam.id]!) {
        return true
      }

      // si ouverture valide
      if (this.isValidOpeningDart(dart)) {
        this.hasStarted[this.currentTeam.id] = true
        return true
      }

      return false
    },

    // Vérification de si le lancer est valid pour l'ouverture
    isValidOpeningDart(dart: DartThrow): boolean {
      if (!this.options.doubleIn && !this.options.masterIn) {
        return true
      } else if (this.options.masterIn) {
        return dart.multiplier >= 2
      } else {
        return dart.multiplier === 2 || dart.sector === 50
      }
    },

    // Vérification de si le lancer est valid pour la fermeture
    isBust(dart: DartThrow): boolean {
      if (this.currentScore < 0) return true
      if (
        this.currentScore === 1 &&
        (this.options.doubleOut || this.options.masterOut)
      )
        return true

      if (this.currentScore !== 0) return false // ← score normal, pas un bust

      // currentScore === 0 : vérifier si le dart de fermeture est valide
      if (this.options.doubleOut && this.options.masterOut) {
        return dart.sector !== 50
      } else if (this.options.doubleOut) {
        return dart.multiplier !== 2 && dart.sector !== 50
      } else if (this.options.masterOut) {
        return (
          dart.multiplier !== 2 &&
          dart.multiplier !== 3 &&
          dart.sector !== 25 &&
          dart.sector !== 50
        )
      }

      return false
    },

    // annuler le dernier le lancer
    cancelThrow(): ProcessRoundResultX01 {
      if (this.current.dartThrows.length === 0)
        throw new Error('cancelThrow: no throws to cancel')

      if (this.currentScore === 0 || this.current.isBust) {
        while (
          this.current.dartThrows.length > 0 &&
          this.current.dartThrows[
            this.current.dartThrows.length - 1
          ]!.sector === 0
        ) {
          this.current.dartThrows.pop()
        }
      }

      if (this.current.isBust) {
        this.current.isBust = false
      }

      this.current.dartThrows.pop()

      return { bust: false, winner: false, needOpenning: false }
    },

    // finir le tour
    endRound() {
      if (this.current.isBust) {
        // Rollback -> restore le score d'avant la volée
        this.currentTeam.score = this.current.scoreSnapshot
      } else {
        // Appliquer le score final
        this.currentTeam.score = this.currentScore
      }

      // Sauvegarder dans l'historique
      this.gameHistory.unshift({
        teamIndex: this.current.teamIndex,
        playerIndex: this.current.playerIndex,
        throws: [...this.current.dartThrows],
        isBust: this.current.isBust,
        isWinner: this.currentScore === 0,
        score: this.currentTeam.score,
      })

      this.current.isBust = false
      this.current.dartThrows = []
    },

    // reset du state
    reset() {
      this.hasStarted = {}

      this.options = {
        startingPoints: X01_VARIANTS.X301,
        doubleIn: false,
        doubleOut: false,
        masterIn: false,
        masterOut: false,
      }
      this.current = {
        teamIndex: 0,
        playerIndex: 0,
        scoreSnapshot: 0,
        dartThrows: [],
        isBust: false,
      }

      this.teams = []
      this.gameHistory = []
    },
  },
})
