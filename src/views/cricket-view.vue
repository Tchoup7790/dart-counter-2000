<script setup lang="ts">
/**
 * CricketView.vue
 * Route : /game/cricket
 */

import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game.store'
import { useCricketStore } from '@/stores/cricket.store'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import GameBarLayout from '@/components/game-bar-layout.vue'
import CricketScoreboard from '@/components/cricket-scoreboard.vue'
import GameBoard from '@/components/game-board.vue'
import RoundHistory from '@/components/round-history.vue'

const game = useGameStore()
const cricketStore = useCricketStore()
const router = useRouter()

const gameBoardRef = ref<InstanceType<typeof GameBoard> | null>(
  null,
)

const state = reactive({ visible: false })

onMounted(() => {
  initRound()
  setTimeout(() => (state.visible = true), 50)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const activeTeamColor = computed(() => {
  const t = game.teams[game.activeTeamIndex]
  return t?.color ?? t?.color ?? 'var(--cs-green)'
})

const teamColors = computed(() =>
  game.teams.map((t) => t.color ?? t.color ?? 'var(--cs-muted)'),
)

const teamNames = computed(() => game.teams.map((t) => t.name))
const teamScores = computed(() => game.teams.map((t) => t.score))

const sectorStates = computed(() =>
  cricketStore.cricketTarget.map((sector) => ({
    sector,
    hitsPerTeam: game.teams.map((_, ti) => {
      const idx = cricketStore.cricketTarget.indexOf(sector)
      return cricketStore.cricketBoard[ti]?.[idx] ?? 0
    }),
    isComplete: game.teams.every((_, ti) => {
      const idx = cricketStore.cricketTarget.indexOf(sector)
      return (cricketStore.cricketBoard[ti]?.[idx] ?? 0) >= 3
    }),
  })),
)

// ─── Init round ───────────────────────────────────────────────────────────────

function initRound() {
  const ti = game.activeTeamIndex
  const pi = game.activePlayerIndex
  const score = game.teams[ti]?.score ?? 0
  cricketStore.initRound(ti, pi, score)
}

// ─── Dart thrown ─────────────────────────────────────────────────────────────

function onDartThrown(dart: DartThrow) {
  const ti = game.activeTeamIndex
  const result = cricketStore.processRound(dart)
  game.addPoints(ti, result.pointsToAdd)
  if (result.winner) game.setWinner(ti)
}

// ─── Round complete ───────────────────────────────────────────────────────────

function onRoundComplete(throws: DartThrow[]) {
  game.commitRound(throws)
  if (!game.isFinished) initRound()
}

// ─── Undo ─────────────────────────────────────────────────────────────────────

function onUndo() {
  cricketStore.cancelThrow()
  gameBoardRef.value?.undoInOverlay()
  game.undoLastThrow()
}

// ─── Victoire ─────────────────────────────────────────────────────────────────

watch(
  () => game.isFinished,
  (finished) => {
    if (finished)
      setTimeout(() => router.push({ name: 'winner' }), 600)
  },
)
</script>

<template>
  <GameBarLayout
    :activeName="teamNames[game.activeTeamIndex] ?? ''"
    :active-team-color="activeTeamColor"
    mode-name="Cricket"
  >
    <div class="view" :class="{ visible: state.visible }">
      <!-- Scoreboard Cricket -->
      <section class="scores-area">
        <CricketScoreboard
          :sectors="cricketStore.cricketTarget"
          :sector-states="sectorStates"
          :bonus-points="teamScores"
          :team-colors="teamColors"
          :team-names="teamNames"
          :active-team="game.activeTeamIndex"
        />
      </section>

      <!-- Cible + contrôles -->
      <GameBoard
        ref="gameBoardRef"
        :active-team-color="activeTeamColor"
        @dart-thrown="onDartThrown"
        @round-complete="onRoundComplete"
        @undo="onUndo"
      />

      <!-- Historique -->
      <div class="history-area">
        <RoundHistory
          :rounds="game.gameHistory"
          :team-colors="teamColors"
          :team-names="teamNames"
        />
      </div>
    </div>
  </GameBarLayout>
</template>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 53px);
  opacity: 0;
  transition: opacity 0.35s ease;
}
.view.visible {
  opacity: 1;
}

.scores-area {
  padding: 8px 12px 0;
}

.history-area {
  margin-top: calc(100vh - 53px);
  padding: 20px 12px 32px;
}
</style>
