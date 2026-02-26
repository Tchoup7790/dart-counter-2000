<script setup lang="ts">
/**
 * AtcView.vue
 * Route : /game/atc
 */

import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game.store'
import { useAtcStore } from '@/stores/atc.store'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import GameBarLayout from '@/components/game-bar-layout.vue'
import AtcProgress from '@/components/atc-progress.vue'
import GameBoard from '@/components/game-board.vue'
import RoundHistory from '@/components/round-history.vue'

// Séquence ATC : 1 → 20 → bull
const ATC_SEQUENCE = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 25,
]

const game = useGameStore()
const atcStore = useAtcStore()
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
  return t?.color ?? t?.color ?? 'var(--cs-cyan)'
})

const teamColors = computed(() =>
  game.teams.map((t) => t.color ?? t.color ?? 'var(--cs-muted)'),
)

const teamNames = computed(() => game.teams.map((t) => t.name))
const progressIndexes = computed(() =>
  game.teams.map((t) => t.score),
)

// ─── Init round ───────────────────────────────────────────────────────────────

function initRound() {
  const ti = game.activeTeamIndex
  const pi = game.activePlayerIndex
  const score = game.teams[ti]?.score ?? 1
  atcStore.initRound(ti, pi, score)
}

// ─── Dart thrown ─────────────────────────────────────────────────────────────

function onDartThrown(dart: DartThrow) {
  const ti = game.activeTeamIndex
  const result = atcStore.processRound(dart)
  // score ATC = numéro courant atteint
  game.setPoints(ti, result.score)
  if (result.winner) game.setWinner(ti)
}

// ─── Round complete ───────────────────────────────────────────────────────────

function onRoundComplete(throws: DartThrow[]) {
  game.commitRound(throws)
  if (!game.isFinished) initRound()
}

// ─── Undo ─────────────────────────────────────────────────────────────────────

function onUndo() {
  const result = atcStore.cancelThrow()
  game.setPoints(game.activeTeamIndex, result.score)
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
    mode-name="ATC"
  >
    <div class="view" :class="{ visible: state.visible }">
      <!-- Progression ATC -->
      <section class="scores-area">
        <AtcProgress
          :progress-indexes="progressIndexes"
          :sequence="ATC_SEQUENCE"
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
