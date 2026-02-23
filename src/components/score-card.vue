<template>
  <div
    class="score-card"
    :class="{
      'score-card--active': active,
      'score-card--bust': bust,
      'score-card--winner': winner,
    }"
    :style="{ '--cs': color }"
  >
    <!-- En-tête -->
    <div class="sc-header">
      <div class="sc-meta">
        <span class="sc-team-name">{{ teamName }}</span>
        <span class="sc-players">{{ players.join(' · ') }}</span>
      </div>

      <span v-if="bust" class="sc-badge sc-badge--bust"
        >BUST</span
      >
      <span v-else-if="winner" class="sc-badge sc-badge--winner"
        >🏆</span
      >
      <span v-else-if="active" class="sc-badge sc-badge--active"
        >▶</span
      >
    </div>

    <!-- Score + delta live -->
    <div class="sc-score-row">
      <span class="sc-score">{{ score }}</span>

      <Transition name="delta">
        <span
          v-if="liveDelta !== undefined && liveDelta > 0"
          class="sc-delta"
          :style="{
            color:
              deltaSign === '−'
                ? 'var(--cs-yellow)'
                : 'var(--cs-green)',
          }"
          >{{ deltaSign }}{{ liveDelta }}</span
        >
      </Transition>
    </div>

    <!-- Sous-info (checkout, progression…) -->
    <span class="sc-sub" v-if="subInfo">{{ subInfo }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  teamName: string
  players: string[]
  color: string
  score: number
  active?: boolean
  bust?: boolean
  winner?: boolean
  liveDelta?: number
  deltaSign?: '−' | '+'
  subInfo?: string
}

withDefaults(defineProps<Props>(), {
  active: false,
  bust: false,
  winner: false,
  deltaSign: '−',
})
</script>

<style scoped>
.score-card {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(
    in srgb,
    var(--tc) 6%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--tc) 15%, transparent);
  border-radius: var(--radius);
  transition:
    background 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

.score-card--active {
  border-color: color-mix(in srgb, var(--tc) 55%, transparent);
  background: color-mix(
    in srgb,
    var(--tc) 12%,
    var(--cs-surface)
  );
  box-shadow: 0 0 18px
    color-mix(in srgb, var(--tc) 14%, transparent);
}

.score-card--bust {
  border-color: color-mix(
    in srgb,
    var(--cs-red) 55%,
    transparent
  );
  background: color-mix(
    in srgb,
    var(--cs-red) 8%,
    var(--cs-surface)
  );
  animation: bust-shake 0.45s ease;
}

.score-card--winner {
  border-color: color-mix(
    in srgb,
    var(--cs-gold) 60%,
    transparent
  );
  background: color-mix(
    in srgb,
    var(--cs-gold) 8%,
    var(--cs-surface)
  );
  box-shadow: 0 0 24px
    color-mix(in srgb, var(--cs-gold) 20%, transparent);
}

@keyframes bust-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

/* En-tête */
.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}

.sc-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sc-team-name {
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--tc);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sc-players {
  font-size: 9px;
  color: var(--cs-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.sc-badge {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 4px;
}

.sc-badge--bust {
  color: var(--cs-red);
  background: color-mix(in srgb, var(--cs-red) 15%, transparent);
  border: 1px solid
    color-mix(in srgb, var(--cs-red) 30%, transparent);
}

.sc-badge--winner {
  font-size: 14px;
  padding: 0;
}

.sc-badge--active {
  color: var(--tc);
  font-size: 11px;
}

/* Score */
.sc-score-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.sc-score {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: var(--tc);
  transition: color 0.2s;
}

.score-card--bust .sc-score {
  color: var(--cs-red);
}
.score-card--winner .sc-score {
  color: var(--cs-gold);
}

.sc-delta {
  font-size: 15px;
  font-weight: 700;
}

/* Sous-info */
.sc-sub {
  font-size: 10px;
  color: var(--cs-green);
  letter-spacing: 0.06em;
  opacity: 0.85;
}

/* Transition delta */
.delta-enter-active,
.delta-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.delta-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.delta-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
