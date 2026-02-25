<template>
  <div class="game-view" :class="{ visible: state.visible }">
    <!-- Barre de statut -->
    <header class="game-bar">
      <div class="game-bar-left">
        <button
          class="btn-menu"
          @click="state.showMenu = true"
          aria-label="Menu"
        >
          ☰
        </button>
        <span class="mode-tag">{{
          game.gameMode?.toUpperCase()
        }}</span>
      </div>

      <div class="game-round">
        <span class="round-label">Round</span>
        <span class="round-number">{{ game.roundNumber }}</span>
      </div>

      <div class="game-bar-right">
        <span
          class="turn-indicator"
          :style="{ color: activeTeamColor }"
        >
          {{ teamNames[game.activeTeamIndex] }}
        </span>
      </div>
    </header>

    <div class="above-fold">
      <!-- Scoreboard -->
      <section class="scoreboard-area">
        <!-- X01 & 221 : cartes de score -->
        <div
          class="score-cards"
          v-if="
            game.gameMode === GameMode.X01 ||
            game.gameMode === GameMode.TWO_HUNDRED_TWENTY_ONE
          "
        >
          <ScoreCard
            v-for="(team, ti) in game.teams"
            :key="ti"
            :team-name="teamNames[ti]!"
            :players="team.players.map((p) => p.name)"
            :color="teamColors[ti]!"
            :score="teamScores[ti]!"
            :active="ti === game.activeTeamIndex"
            :bust="state.isBust && ti === game.activeTeamIndex"
            :winner="game.teamWinner === ti"
            :live-delta="
              ti === game.activeTeamIndex && liveTotal > 0
                ? liveTotal
                : undefined
            "
            :delta-sign="
              game.gameMode === GameMode.X01 ? '−' : '+'
            "
          />
        </div>

        <!-- Cricket -->
        <CricketScoreboard
          v-else-if="game.gameMode === GameMode.CRICKET"
          :sectors="cricketStore.cricketTarget"
          :sector-states="cricketSectorStates"
          :bonus-points="teamScores"
          :team-colors="teamColors"
          :team-names="teamNames"
          :active-team="game.activeTeamIndex"
        />

        <!-- ATC -->
        <AtcProgress
          v-else-if="game.gameMode === GameMode.ATC"
          :progress-indexes="atcProgressIndexes"
          :sequence="ATC_SEQUENCE"
          :team-colors="teamColors"
          :team-names="teamNames"
          :active-team="game.activeTeamIndex"
        />
      </section>

      <!-- Cible -->
      <div class="board-area">
        <DartboardOverlay
          ref="dartboardRef"
          :active-team-color="activeTeamColor"
          :disabled="game.isFinished"
          @dart-thrown="onDartThrown"
          @round-complete="onRoundComplete"
        />
      </div>

      <!-- Contrôles -->
      <GameControls
        :throw-count="dartboardRef?.currentThrows?.length ?? 0"
        :active-color="activeTeamColor"
        :can-validate="
          (dartboardRef?.currentThrows?.length ?? 0) > 0
        "
        @undo="handleUndo"
        @validate="handleValidate"
      />
    </div>
    <!-- Historique-->
    <div
      class="history-area"
      v-if="
        game.gameMode === GameMode.X01 ||
        game.gameMode === GameMode.TWO_HUNDRED_TWENTY_ONE
      "
    >
      <RoundHistory
        :rounds="game.gameHistory"
        :team-colors="teamColors"
        :team-names="teamNames"
      />
    </div>

    <!-- Menu pause -->
    <Transition name="menu">
      <div
        class="menu-overlay"
        v-if="state.showMenu"
        @click.self="state.showMenu = false"
      >
        <div class="menu-drawer">
          <div class="menu-header">
            <span class="menu-title">🎯 Partie en cours</span>
            <button
              class="btn-close"
              @click="state.showMenu = false"
            >
              ✕
            </button>
          </div>
          <div class="menu-body">
            <button
              class="menu-item"
              @click="state.showMenu = false"
            >
              ▶ Reprendre
            </button>
            <button
              class="menu-item menu-item--danger"
              @click="quitGame"
            >
              🚪 Quitter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game.store'
import { useX01Store } from '@/stores/x01.store'
import { use221Store } from '@/stores/two-hundred-twenty-one.store'
import { useCricketStore } from '@/stores/cricket.store'
import { useAtcStore } from '@/stores/atc.store'
import { GameMode } from '@/models/enums/game-mode.enum'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import ScoreCard from '@/components/score-card.vue'
import CricketScoreboard from '@/components/cricket-scoreboard.vue'
import AtcProgress from '@/components/atc-progress.vue'
import RoundHistory from '@/components/round-history.vue'
import GameControls from '@/components/game-controls.vue'
import DartboardOverlay from '@/components/dartboard-overlay.vue'
import { ATC_SEQUENCE } from '@/utils/constantes'

// Stores
const game = useGameStore()
const x01Store = useX01Store()
const s221Store = use221Store()
const cricketStore = useCricketStore()
const atcStore = useAtcStore()
const router = useRouter()

// État local
interface ViewState {
  visible: boolean
  showMenu: boolean
  isBust: boolean
  liveThrows: DartThrow[]
  scoreSnapshot: number
}

const state = reactive<ViewState>({
  visible: false,
  showMenu: false,
  isBust: false,
  liveThrows: [],
  scoreSnapshot: 0,
})

const dartboardRef = ref<InstanceType<
  typeof DartboardOverlay
> | null>(null)

// Initialisation
onMounted(() => {
  initRoundForActive()
  setTimeout(() => (state.visible = true), 50)
})

// Démarre un round dans le store de mode pour l'équipe/joueur actif.
function initRoundForActive() {
  const ti = game.activeTeamIndex
  const pi = game.activePlayerIndex
  const score = game.teams[ti]?.points ?? 0

  state.scoreSnapshot = score

  switch (game.gameMode) {
    case GameMode.X01:
      x01Store.initRound(ti, pi, score)
      break
    case GameMode.TWO_HUNDRED_TWENTY_ONE:
      s221Store.initRound(ti, pi, score)
      break
    case GameMode.CRICKET:
      cricketStore.initRound(ti, pi, score)
      break
    case GameMode.ATC:
      atcStore.initRound(ti, pi, score)
      break
  }
}

// Computed
// Couleur de l'équipe active.
const activeTeamColor = computed(() => {
  const team = game.teams[game.activeTeamIndex]
  return team?.color ?? team?.color ?? 'var(--cs-green)'
})

// Couleur par équipe (même logique).
const teamColors = computed(() =>
  game.teams.map((t) => t.color ?? t.color ?? 'var(--cs-muted)'),
)

// Nom affiché par équipe.
const teamNames = computed(() => game.teams.map((t) => t.name))

// Scores affichés (team.points).
const teamScores = computed(() =>
  game.teams.map((t) => t.points),
)

// Total live de la volée en cours (pour affichage delta sur ScoreCard).
const liveTotal = computed(() =>
  state.liveThrows.reduce((sum, t) => sum + t.value, 0),
)
// États des secteurs pour CricketScoreboard.
const cricketSectorStates = computed(() => {
  if (game.gameMode !== GameMode.CRICKET) return []
  return cricketStore.cricketTarget.map((sector) => ({
    sector,
    hitsPerTeam: game.teams.map((_, ti) => {
      const idx = cricketStore.cricketTarget.indexOf(sector)
      return cricketStore.cricketBoard[ti]?.[idx] ?? 0
    }),
    isComplete: game.teams.every((_, ti) => {
      const idx = cricketStore.cricketTarget.indexOf(sector)
      return (cricketStore.cricketBoard[ti]?.[idx] ?? 0) >= 3
    }),
  }))
})

// Progression ATC par équipe (score courant = numéro atteint).
const atcProgressIndexes = computed(() =>
  game.teams.map((t) => t.points),
)

// Handlers fléchettes
function onDartThrown(dart: DartThrow): void {
  state.liveThrows.push(dart)
  applyDartToModeStore(dart)
}

function applyDartToModeStore(dart: DartThrow): void {
  const ti = game.activeTeamIndex

  switch (game.gameMode) {
    case GameMode.X01: {
      const result = x01Store.processRound(dart)
      if (result.bust) {
        triggerBust()
        return
      }
      // currentScore dans le store = score restant après ce lancer
      game.restorePoints(
        ti,
        x01Store.currentScore ?? game.teams[ti]!.points,
      )
      if (result.winner) game.setWinner(ti)
      break
    }

    case GameMode.TWO_HUNDRED_TWENTY_ONE: {
      const result = s221Store.processRound(dart)
      if (result.bust) {
        triggerBust()
        return
      }
      // Appliquer les resets à zéro des autres équipes
      result.resetToZero.forEach((val, idx) => {
        if (
          idx !== ti &&
          val === 0 &&
          game.teams[idx]!.points !== 0
        ) {
          game.restorePoints(idx, 0)
        }
      })
      // currentScore dans le store = score accumulé après ce lancer
      game.restorePoints(
        ti,
        s221Store.currentScore ?? game.teams[ti]!.points,
      )
      if (result.winner) game.setWinner(ti)
      break
    }

    case GameMode.CRICKET: {
      const result = cricketStore.processRound(dart)
      game.addPoints(ti, result.pointsToAdd)
      if (result.winner) game.setWinner(ti)
      break
    }

    case GameMode.ATC: {
      const result = atcStore.processRound(dart)
      // En ATC, le score = le numéro courant atteint
      game.restorePoints(ti, result.score)
      if (result.winner) game.setWinner(ti)
      break
    }
  }
}

function onRoundComplete(throws: DartThrow[]): void {
  game.commitRound(throws)
  state.liveThrows = []

  if (!game.isFinished) {
    initRoundForActive()
  }
}

// Undo
function handleUndo(): void {
  if (state.liveThrows.length === 0) return

  // Annuler dans le store de mode
  let prevScore: number | undefined

  switch (game.gameMode) {
    case GameMode.X01: {
      const result = x01Store.cancelThrow()
      prevScore = result.pointsToSubstract
      break
    }
    case GameMode.TWO_HUNDRED_TWENTY_ONE: {
      const result = s221Store.cancelThrow()
      prevScore = result.pointsToAdd
      break
    }
    case GameMode.CRICKET: {
      cricketStore.cancelThrow()
      break
    }
    case GameMode.ATC: {
      const result = atcStore.cancelThrow()
      prevScore = result.score
      break
    }
  }

  // Restaurer le score dans le gameStore
  if (prevScore !== undefined) {
    game.restorePoints(game.activeTeamIndex, prevScore)
  }

  // Annuler dans le dartboardOverlay
  dartboardRef.value?.undoLastThrow()
  state.liveThrows.pop()
  game.undoLastThrow()

  // Retirer le bust visuel si on revient en arrière
  if (state.isBust) state.isBust = false
}

// Validate manuel
function handleValidate(): void {
  dartboardRef.value?.forceCommit()
}

// Bust
function triggerBust(): void {
  state.isBust = true
  setTimeout(() => (state.isBust = false), 1200)
}

// Navigation victoire
watch(
  () => game.isFinished,
  (finished) => {
    if (finished)
      setTimeout(() => router.push({ name: 'winner' }), 600)
  },
)

// Quitter
function quitGame(): void {
  game.reset()
  router.push({ name: 'home' })
}
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.game-view.visible {
  opacity: 1;
}

/* Barre */
.game-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 15%, transparent);
  background: color-mix(
    in srgb,
    var(--cs-surface) 90%,
    transparent
  );
  backdrop-filter: blur(6px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.game-bar-left,
.game-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 90px;
}
.game-bar-right {
  justify-content: flex-end;
}

.btn-menu {
  background: transparent;
  border: none;
  color: var(--cs-subtle);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition:
    color var(--transition),
    background var(--transition);
}
.btn-menu:hover {
  color: var(--cs-text);
  background: var(--cs-overlay);
}

.mode-tag {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cs-muted);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 25%, transparent);
  padding: 2px 7px;
  border-radius: 4px;
}

.game-round {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.round-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cs-muted);
}
.round-number {
  font-size: 22px;
  font-weight: 700;
  color: var(--cs-text);
}

.turn-indicator {
  font-size: 12px;
  letter-spacing: 0.06em;
  font-weight: 700;
  text-align: right;
}

/* Scoreboard */
.scoreboard-area {
  padding: 8px 12px 0;
}
.score-cards {
  display: flex;
  gap: 8px;
}

/* Cible */
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 20px 38px;
  min-height: 260px;
}

/* Above fold */
.above-fold {
  min-height: calc(97vh - 32px);
  display: flex;
  flex-direction: column;
}

/* Historique */
.history-area {
  padding: 0 12px;
}

/* Menu pause */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.menu-drawer {
  width: 100%;
  background: var(--cs-surface);
  border-top: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
  border-radius: 20px 20px 0 0;
  padding-bottom: 32px;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 15%, transparent);
}
.menu-title {
  font-size: 15px;
  letter-spacing: 0.06em;
}
.btn-close {
  background: transparent;
  border: none;
  color: var(--cs-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color var(--transition);
}
.btn-close:hover {
  color: var(--cs-text);
}

.menu-body {
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.menu-item {
  text-align: left;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  background: var(--cs-overlay);
  color: var(--cs-text);
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: 0.04em;
}
.menu-item:hover {
  border-color: color-mix(
    in srgb,
    var(--cs-muted) 30%,
    transparent
  );
}
.menu-item--danger {
  color: var(--cs-red);
}
.menu-item--danger:hover {
  background: color-mix(
    in srgb,
    var(--cs-red) 10%,
    var(--cs-overlay)
  );
  border-color: color-mix(
    in srgb,
    var(--cs-red) 30%,
    transparent
  );
}

/* Transitions menu */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s ease;
}
.menu-enter-active .menu-drawer,
.menu-leave-active .menu-drawer {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-from .menu-drawer,
.menu-leave-to .menu-drawer {
  transform: translateY(100%);
}
</style>
