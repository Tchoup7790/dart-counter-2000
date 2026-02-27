<template>
  <GameBarLayout
    :activeName="
      x01Store.currentTeam.players.length > 1
        ? `${
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
    :mode-name="`${x01Store.options.startingPoints}`"
    :options="
      [
        x01Store.options.doubleIn && 'DI',
        x01Store.options.masterIn && 'MI',
        x01Store.options.doubleOut && 'DO',
        x01Store.options.masterOut && 'MO',
      ].filter(Boolean)
    "
    :round-number="game.roundNumber"
    @quit="quitGame"
  >
    <div class="view" :class="{ visible: state.visible }">
      <!-- ScoreCards -->
      <section class="scores-area" ref="scrollContainer">
        <div class="score-cards">
          <ScoreCard
            v-for="{ team, index } in sortedTeams"
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
import { onMounted, watch, reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useX01Store } from '@/stores/x01.store'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import GameBarLayout from '@/components/game-bar-layout.vue'
import ScoreCard from '@/components/score-card.vue'
import GameBoard from '@/components/game-board.vue'
import { useGameStore } from '@/stores/game.store'
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
  if (x01Store.roundInProgress) {
    x01Store.restoreRound()
  } else {
    x01Store.initRound(game.roundNumber, game.gameHistory.length)
  }
  setTimeout(() => (state.visible = true), 50)
})

// Dart thrown
function onDartThrown(dart: DartThrow) {
  const result = x01Store.processRound(dart)
  if (result.winner) game.setWinner(x01Store.current.teamIndex)
}

// Round complete
function onRoundComplete() {
  const roundResult = x01Store.endRound()

  // D'abord commit dans le gameStore pour mettre à jour gameHistory et roundNumber
  game.commitRound(roundResult)

  if (game.teamWinner !== undefined)
    game.status = STATUS.FINISHED
  if (!game.isFinished)
    x01Store.initRound(game.roundNumber, game.gameHistory.length)
  scrollToStart()
}

// Quit
function quitGame() {
  game.reset()
  x01Store.reset()
  router.push({ name: 'home' })
}

const sortedTeams = computed(() => {
  if (x01Store.teams.length > 3) {
    return x01Store.teams
      .map((team, index) => ({ team, index }))
      .sort((a, b) => {
        // L'équipe active toujours en premier
        if (a.team.id === x01Store.currentTeam.id) return -1
        if (b.team.id === x01Store.currentTeam.id) return 1

        // Les autres dans l'ordre naturel par rapport à l'actif
        const activeIndex = x01Store.current.teamIndex
        const aNorm =
          (a.index - activeIndex + x01Store.teams.length) %
          x01Store.teams.length
        const bNorm =
          (b.index - activeIndex + x01Store.teams.length) %
          x01Store.teams.length
        return aNorm - bNorm
      })
  } else {
    return x01Store.teams.map((team, index) => ({ team, index }))
  }
})

// Victoire
watch(
  () => game.isFinished,
  (finished) => {
    if (finished)
      setTimeout(() => router.push({ name: 'winner' }), 600)
  },
)

const scrollContainer = ref<HTMLDivElement | null>(null)

// scroll pour voir l'équipe active
function scrollToStart() {
  scrollContainer.value?.scrollTo({
    left: 0,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.view {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: auto;
  min-height: calc(97vh - 53px);
  opacity: 0;
  transition: opacity 0.35s ease;
  overflow-x: visible;
  overflow-y: visible;
}

.view.visible {
  opacity: 1;
}

.scores-area {
  padding: 24px 12px;
  overflow-y: visible;
  overflow-x: scroll;
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
