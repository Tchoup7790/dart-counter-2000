<template>
  <GameBarLayout
    :activeName="
      x01Store.currentTeam.players.length > 1
        ? `${x01Store.currentTeam.name} > ${
            x01Store.currentTeam.players[
              x01Store.current.playerIndex
            ]!.name
          } `
        : x01Store.currentTeam.players[
            x01Store.current.playerIndex
          ]!.name
    "
    :active-team-color="
      x01Store.currentTeam.color ?? 'var(--cs-green)'
    "
    :mode-name="GameMode.X01"
    :round-number="x01Store.roundNumber"
    @quit="quitGame"
  >
    <div class="view" :class="{ visible: state.visible }">
      <!-- ScoreCards -->
      <section class="scores-area">
        <div class="score-cards">
          <ScoreCard
            v-for="(team, index) in x01Store.teams"
            class="score-card"
            :key="index"
            :name="
              team.players!.length > 1
                ? team.name
                : team.players[0]!.name
            "
            :players="team.players.map((p) => p.name)"
            :color="team.color"
            :score="
              team.id === x01Store.currentTeam.id
                ? x01Store.currentScore
                : team.score
            "
            :active="team.id === x01Store.currentTeam.id"
            :bust="
              x01Store.current.isBust &&
              team.id === x01Store.currentTeam.id
            "
            :winner="game.teamWinner === index"
            :live-delta="
              team.id === x01Store.currentTeam.id
                ? x01Store.delta
                : undefined
            "
            delta-sign="−"
          />
        </div>
      </section>

      <!-- Cible + contrôles -->
      <GameBoard
        :current-throws="x01Store.current.dartThrows"
        :is-bust="x01Store.current.isBust"
        :active-team-color="
          x01Store.currentTeam?.color ?? 'var(--cs-green)'
        "
        @dart-thrown="onDartThrown"
        @validate="onRoundComplete"
        @undo="x01Store.cancelThrow()"
      />
    </div>
  </GameBarLayout>
</template>

<script setup lang="ts">
import { onMounted, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useX01Store } from '@/stores/x01.store'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import GameBarLayout from '@/components/game-bar-layout.vue'
import ScoreCard from '@/components/score-card.vue'
import GameBoard from '@/components/game-board.vue'
import { useGameStore } from '@/stores/game.store'
import { GameMode } from '@/models/enums/game-mode.enum'
import { STATUS } from '@/models/enums/status.enum'

const x01Store = useX01Store()
const game = useGameStore()
const router = useRouter()

interface X01State {
  visible: boolean
}

// State
const state: X01State = reactive({
  visible: false,
})

onMounted(() => {
  x01Store.initRound()
  setTimeout(() => (state.visible = true), 50)
})

// Dart thrown
function onDartThrown(dart: DartThrow) {
  const result = x01Store.processRound(dart)
  if (result.winner) game.setWinner(x01Store.current.teamIndex)
}

// Round complete
function onRoundComplete() {
  x01Store.endRound()

  if (game.teamWinner !== undefined)
    game.status = STATUS.FINISHED
  if (!game.isFinished) x01Store.initRound()
}

// Quit
function quitGame() {
  game.reset()
  x01Store.reset()
  router.push({ name: 'home' })
}

// TODO:Pour changer l'affichage
const sortedTeams = computed(() => {
  const others = x01Store.teams.filter(
    (t) => t.id !== x01Store.currentTeam.id,
  )
  return [x01Store.currentTeam, ...others]
})

// Victoire
watch(
  () => game.isFinished,
  (finished) => {
    if (finished)
      setTimeout(() => router.push({ name: 'winner' }), 600)
  },
)
</script>

<style scoped>
.view {
  display: flex;
  width: 100%;
  flex-direction: column;
  min-height: calc(100vh - 53px);
  opacity: 0;
  transition: opacity 0.35s ease;
}
.view.visible {
  opacity: 1;
}

.scores-area {
  padding: 8px 12px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.score-cards {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.score-card {
  min-width: 100px;
  flex-shrink: 0;
}
</style>
