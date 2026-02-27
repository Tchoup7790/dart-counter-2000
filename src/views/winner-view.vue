<template>
  <div class="winner-view" :class="{ visible }">
    <!-- Confettis -->
    <div class="confetti-layer" aria-hidden="true">
      <div
        v-for="c in confetti"
        :key="c.id"
        class="confetto"
        :style="{
          left: `${c.x}%`,
          width: `${c.size}px`,
          height: `${c.size * 0.5}px`,
          background: c.color,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.dur}s`,
          transform: `rotate(${c.rot}deg)`,
        }"
      />
    </div>

    <!-- Contenu -->
    <div class="content">
      <!-- Nom gagnant -->
      <div class="winner-block">
        <p class="winner-label">Vainqueur</p>
        <h1 class="winner-name" :style="{ color: winnerColor }">
          {{ winnerName }}
        </h1>
      </div>

      <!-- Séparateur -->
      <div class="divider" />

      <!-- Classement -->
      <div class="rankings">
        <p class="rankings-title">Scores finaux</p>
        <div class="rank-list">
          <div
            v-for="(team, i) in rankings"
            :key="team.name"
            class="rank-row"
            :class="{ 'rank-row--winner': team.isWinner }"
            :style="{
              '--tc': team.color,
              animationDelay: `${0.2 + i * 0.08}s`,
            }"
          >
            <span class="rank-pos">{{
              team.isWinner ? '🥇' : `#${i + 1}`
            }}</span>

            <div class="rank-info">
              <span
                class="rank-name"
                :style="{
                  color: team.isWinner
                    ? team.color
                    : 'var(--cs-text)',
                }"
              >
                {{ team.name }}
              </span>
              <span
                class="rank-players"
                v-if="team.players.length > 1"
              >
                {{ team.players.join(', ') }}
              </span>
            </div>

            <span
              class="rank-score"
              :style="{ color: team.color }"
              >{{ team.score }}</span
            >
          </div>
        </div>
      </div>

      <!-- Bouton -->
      <div class="btn-sector">
        <button class="btn" @click="goHome">🏠 Accueil</button>
        <button class="btn danger" @click="restart()">
          🔄 Recommencer
        </button>
      </div>

      <!-- Séparateur -->
      <div class="divider" />

      <RoundHistory />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game.store'
import RoundHistory from '@/components/round-history.vue'
import type { GameMode } from '@/models/enums/game-mode.enum'

const game = useGameStore()
const router = useRouter()

const visible = ref(false)
onMounted(() => setTimeout(() => (visible.value = true), 50))

// Gagnant
const winnerIndex = computed(() => game.teamWinner ?? 0)

const winnerName = computed(
  () => game.teams[winnerIndex.value]?.name ?? '?',
)

const winnerColor = computed(() => {
  const t = game.teams[winnerIndex.value]
  return t?.color ?? t?.color ?? 'var(--cs-green)'
})

// Classement
const rankings = computed(() =>
  game.teams
    .map((t, i) => ({
      name: t.name,
      color: t.color ?? t.color ?? 'var(--cs-muted)',
      score: t.score,
      players: t.players.map((p) => p.name),
      isWinner: i === winnerIndex.value,
    }))
    .sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0)),
)

// Confettis

const COLORS = [
  '#2ecc71',
  '#c0392b',
  '#f1c40f',
  '#3498db',
  '#9b59b6',
  '#e67e22',
  '#1abc9c',
  '#e91e63',
]

const confetti = Array.from({ length: 52 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: COLORS[i % COLORS.length]!,
  delay: Math.random() * 2.5,
  dur: 2.5 + Math.random() * 2,
  size: 6 + Math.random() * 8,
  rot: Math.random() * 360,
}))

function goHome() {
  game.reset()
  router.push({ name: 'home' })
}
function restart() {
  game.restart()
  const mode: GameMode | undefined = game.gameMode
  if (mode === undefined) {
    goHome()
  }
  router.push({ name: 'setup', params: { mode } })
}
</script>

<style scoped>
.winner-view {
  min-height: 97vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  overflow: hidden;
  position: relative;
  opacity: 0;
  transition: opacity 0.4s ease;
  padding: 142px 48px 0;
}
.winner-view.visible {
  opacity: 1;
}

/* Confettis */
.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
.confetto {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: fall linear infinite;
  opacity: 0.9;
}
@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.9;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

/* Contenu */
.content {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Gagnant */
.winner-block {
  text-align: center;
}
.winner-label {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cs-muted);
}
.winner-name {
  margin: 0;
  font-size: 38px;
  font-weight: 900;
  letter-spacing: 0.03em;
  line-height: 1.1;
}

/* Séparateur */
.divider {
  width: 100%;
  height: 1px;
  background: color-mix(
    in srgb,
    var(--cs-muted) 20%,
    transparent
  );
}

/* Classement */
.rankings {
  width: 100%;
  padding-bottom: 24px;
}
.rankings-title {
  margin: 0 0 10px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cs-muted);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--cs-surface);
  border: 1px solid
    color-mix(in srgb, var(--tc) 12%, transparent);
  border-radius: var(--radius);
  animation: slide-in 0.4s ease both;
}

.rank-row--winner {
  background: color-mix(
    in srgb,
    var(--tc) 8%,
    var(--cs-surface)
  );
  border-color: color-mix(in srgb, var(--tc) 30%, transparent);
  box-shadow: 0 0 24px
    color-mix(in srgb, var(--tc) 10%, transparent);
}

.rank-pos {
  font-size: 18px;
  min-width: 28px;
  text-align: center;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rank-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-players {
  font-size: 10px;
  color: var(--cs-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-score {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Bouton */
.btn-sector {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
}
.btn {
  width: 100%;
  padding: 15px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
}
</style>
