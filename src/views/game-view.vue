<template>
  <div class="game-view" :class="state.visible ? 'visible' : ''">
    <!-- BARRE DE STATUT -->
    <header class="game-bar">
      <div class="game-bar-left">
        <button
          class="btn-menu"
          aria-label="Menu"
          @click="state.showMenu = true"
        >
          ☰
        </button>
        <span class="game-mode-tag">{{
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

    <!-- SCOREBOARD — adapté au mode -->
    <section class="scoreboard-area">
      <!-- X01 & 221 : cartes de score simples -->
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
          :players="team.players.map((p: Player) => p.name)"
          :color="teamColors[ti]!"
          :score="teamScores[ti]!"
          :sub-info="subInfoForTeam(ti)"
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

      <!-- Cricket : tableau des croix -->
      <CricketScoreboard
        v-else-if="game.gameMode === GameMode.CRICKET"
        :sectors="cricket.activeSectors"
        :sector-states="cricketSectorStates"
        :bonus-points="cricket.bonusPoints"
        :team-colors="teamColors"
        :team-names="teamNames"
        :active-team="game.activeTeamIndex"
      />

      <!-- ATC : barres de progression -->
      <AtcProgress
        v-else-if="game.gameMode === GameMode.ATC"
        :progress-indexes="atc.progress"
        :team-colors="teamColors"
        :team-names="teamNames"
        :active-team="game.activeTeamIndex"
        :sequence="atc.ATC_SEQUENCE"
      />
    </section>

    <!-- CIBLE INTERACTIVE -->
    <div class="board-area">
      <DartboardOverlay
        ref="dartboardRef"
        :active-team-color="activeTeamColor"
        :historic-darts="state.previousDarts"
        :disabled="game.isFinished"
        @dart-thrown="onDartThrown"
        @round-complete="onRoundComplete"
      />
    </div>

    <!-- HISTORIQUE DES VOLÉES (X01 / 221) -->
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
        :max-visible="4"
      />
    </div>

    <!-- CONTRÔLES  -->
    <GameControls
      :throw-count="state.liveThrows.length"
      :active-color="activeTeamColor"
      :can-validate="state.liveThrows.length > 0"
      :checkout="checkout"
      @undo="handleUndo"
      @validate="handleValidate"
    />

    <!-- MENU PAUSE (drawer bas) -->
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
              aria-label="Fermer le menu"
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
              🚪 Quitter la partie
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

import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type { X01Options } from '@/models/interfaces/x01.interface'
import type { Player } from '@/models/interfaces/player.interface'
import { useGameStore } from '@/stores/game.store'
import { GameMode } from '@/models/enums/game-mode.enum'
import { useX01 } from '@/composables/use-X01'
import { use221 } from '@/composables/use-221'
import { useCricket } from '@/composables/use-cricket'
import { useAtc } from '@/composables/use-atc'
import type { TwoHundredTwentyOneOptions } from '@/models/interfaces/two-hundred-twenty-one.interface'
import type { CricketOptions } from '@/models/interfaces/cricket.interface'
import type { AtcOptions } from '@/models/interfaces/arround-the-clock.interface'
import type { PlacedDart } from '@/models/interfaces/placed-dart.interface'
import ScoreCard from '@/components/score-card.vue'
import CricketScoreboard from '@/components/cricket-scoreboard.vue'
import AtcProgress from '@/components/atc-progress.vue'
import DartboardOverlay from '@/components/dartboard-overlay.vue'
import RoundHistory from '@/components/round-history.vue'
import GameControls from '@/components/game-controls.vue'

interface GameViewState {
  visible: boolean
  showMenu: boolean
  isBust: boolean
  previousDarts: PlacedDart[]
  liveThrows: DartThrow[]
}

const state: GameViewState = reactive({
  visible: false,
  showMenu: false,
  isBust: false,
  previousDarts: [],
  liveThrows: [],
})

// Store
const game = useGameStore()
const router = useRouter()

// Instanciation des composables selon le mode
const x01 = useX01(game.options as X01Options)
const s221 = use221(game.options as TwoHundredTwentyOneOptions)
const cricket = useCricket(
  game.options as CricketOptions,
  game.teams.length,
)
const atc = useAtc(game.options as AtcOptions)

// Initialisation des états internes des composables
onMounted(() => {
  const teamPlayerCounts = game.teams.map(
    (t) => t.players.length,
  )
  switch (game.gameMode) {
    case GameMode.X01:
      x01.init(game.teams.length, teamPlayerCounts)
      break
    case GameMode.CRICKET:
      cricket.init()
      break
    case GameMode.ATC:
      atc.init(game.teams.length)
      break
  }

  setTimeout(() => (state.visible = true), 50)
})

// Ref composant cible
const dartboardRef = ref<InstanceType<
  typeof DartboardOverlay
> | null>(null)

const activeTeamColor = computed(
  () =>
    game.teams[game.activeTeamIndex]?.players[0]?.color ??
    'var(--cs-green)',
)

const teamColors = computed(() =>
  game.teams.map(
    (t) => t.players[0]?.color ?? 'var(--cs-muted)',
  ),
)

const teamNames = computed(() => game.teams.map((t) => t.name))

// Score affiché par équipe
const teamScores = computed(() =>
  game.teams.map((t) => t.points),
)

// Total live de la volée en cours
const liveTotal = computed(() =>
  state.liveThrows.reduce((sum, t) => sum + t.value, 0),
)

// Checkout X01 suggéré pour l'équipe active
const checkout = computed((): string | undefined => {
  if (game.gameMode !== GameMode.X01) return undefined
  const score = game.teams[game.activeTeamIndex]?.points
  return score !== undefined
    ? x01.suggestCheckout(score)
    : undefined
})

// États des secteurs cricket pour le CricketScoreboard
const cricketSectorStates = computed(() => {
  if (game.gameMode !== GameMode.CRICKET) return []
  return cricket.activeSectors.map((sector) => ({
    sector,
    hitsPerTeam: game.teams.map((_, ti) =>
      cricket.getHits(ti, sector),
    ),
    isComplete: cricket.isSectorComplete(sector),
  }))
})

// Handlers cible
function onDartThrown(dart: DartThrow): void {
  state.liveThrows.push(dart)
  game.registerThrow(dart)
}

function onRoundComplete(throws: DartThrow[]): void {
  // Sauvegarder les positions pour l'overlay visuel de la prochaine volée
  state.previousDarts = throws.map((t) => ({
    throw: t,
    teamIndex: game.activeTeamIndex,
    playerColor: activeTeamColor.value,
  }))

  switch (game.gameMode) {
    case GameMode.X01:
      handleX01Round(throws)
      break
    case GameMode.TWO_HUNDRED_TWENTY_ONE:
      handle221Round(throws)
      break
    case GameMode.CRICKET:
      handleCricketRound(throws)
      break
    case GameMode.ATC:
      handleAtcRound(throws)
      break
  }

  state.liveThrows = []
}

function handleUndo(): void {
  dartboardRef.value?.undoLastThrow()
  state.liveThrows.pop()
  game.undoLastThrow()
}

function handleValidate(): void {
  dartboardRef.value?.forceCommit()
}

// Traitement X01
function handleX01Round(throws: DartThrow[]): void {
  const ti = game.activeTeamIndex
  const pi = game.activePlayerIndex
  const currentScore = game.teams[ti]?.points ?? 0

  const result =
    x01.processRound(ti, pi, currentScore, throws) ?? undefined

  if (result!.bust) {
    triggerBust()
    game.commitRound([])
    return
  }

  game.subtractPoints(ti, result!.pointsToSubstract ?? 0)

  if (result!.winner) {
    game.setWinner(ti)
  }

  game.commitRound(result!.validThrows)
}

// Traitement 221
function handle221Round(throws: DartThrow[]): void {
  const ti = game.activeTeamIndex
  const currentScore = game.teams[ti]?.points ?? 0
  const allScores = game.teams.map((t) => t.points)

  const result = s221.processRound(
    ti,
    currentScore,
    allScores,
    throws,
  )

  if (result.resetToZero) {
    game.restorePoints(ti, 0)
  } else {
    game.addPoints(ti, result.pointsToAdd)
  }

  if (result.winner) {
    game.setWinner(ti)
  }

  game.commitRound(result.validThrows)
}

// Traitement Cricket
function handleCricketRound(throws: DartThrow[]): void {
  const ti = game.activeTeamIndex

  const result = cricket.processRound(ti, throws)

  // Appliquer les mutations de points bonus
  result.pointDeltas.forEach(({ teamIndex, delta }) => {
    if (delta > 0) game.addPoints(teamIndex, delta)
    else if (delta < 0)
      game.subtractPoints(teamIndex, Math.abs(delta))
  })

  if (result.winner !== undefined) {
    game.setWinner(result.winner)
  }

  game.commitRound(throws)
}

// Traitement ATC
function handleAtcRound(throws: DartThrow[]): void {
  const ti = game.activeTeamIndex

  const result = atc.processRound(ti, throws)

  // ATC : les points = la progression (numéro atteint)
  if (result.winner) {
    game.setWinner(ti)
  }

  game.commitRound(throws)
}

// UI helpers
function triggerBust(): void {
  state.isBust = true
  setTimeout(() => {
    state.isBust = false
  }, 1200)
}

// Naviguer vers la victoire quand le store passe en FINISHED
watch(
  () => game.isFinished,
  (finished) => {
    if (finished) {
      setTimeout(() => router.push({ name: 'winner' }), 600)
    }
  },
)

function quitGame(): void {
  game.reset()
  router.push({ name: 'home' })
}

// Sous-info ScoreCard
function subInfoForTeam(ti: number): string | undefined {
  switch (game.gameMode) {
    case GameMode.X01:
      return x01.suggestCheckout(game.teams[ti]?.points ?? 0)
    case GameMode.ATC: {
      const prog = atc.progress[ti] ?? 0
      const target = atc.nextTarget(ti)
      return `${prog}/${atc.ATC_SEQUENCE.length} → ${target === 25 ? 'Bull' : target}`
    }
    default:
      return undefined
  }
}
</script>

<style scoped>
/* Entrée */
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

/* Status bar */
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

.game-mode-tag {
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
  padding: 6px 20px 44px; /* 44px = espace throw-summary */
  min-height: 260px;
}

/* Historique */
.history-area {
  padding: 0 12px 4px;
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

/* Transition menu drawer */
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
