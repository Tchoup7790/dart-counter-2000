<template>
  <div class="round-history">
    <p class="rh-title">Historique</p>
    <div class="rh-list">
      <div
        v-for="round in x01Store.gameHistory"
        :key="`${round.teamIndex}`"
        class="rh-row"
        :style="{
          '--tc':
            x01Store.teamColors[round.teamIndex] ??
            'var(--cs-muted)',
        }"
      >
        <span class="rh-dot" />

        <span class="rh-name">
          {{
            x01Store.teams[round.teamIndex]!.players[
              round.playerIndex
            ]!.name
          }}
          -
        </span>

        <div class="rh-throws">
          <span v-if="round.isBust" class="rh-bust-label"
            >BUST</span
          >
          <template v-else>
            <span
              v-for="(dart, j) in round.throws"
              :key="j"
              class="rh-dart"
              >{{ label(dart) }}</span
            >
          </template>
        </div>

        <span class="rh-total">{{ round.score }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import { useX01Store } from '@/stores/x01.store'

const x01Store = useX01Store()

function label(t: DartThrow): string {
  if (t.sector === 50) return 'Bull'
  if (t.sector === 25) return 'S-Bull'
  const p =
    t.multiplier === 3 ? 'T' : t.multiplier === 2 ? 'D' : ''
  return `${p}${t.sector}`
}
</script>

<style scoped>
.round-history {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 24px 0;
  width: 100%;
}

.rh-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cs-muted);
  padding: 0 2px;
}

.rh-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rh-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--cs-surface);
  border: 1.5px solid var(--cs-overlay);
  border-radius: 7px;
}

.rh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tc);
  flex-shrink: 0;
}

.rh-name {
  font-size: 12px;
  color: var(--cs-subtle);
  letter-spacing: 0.03em;
}

.rh-throws {
  flex: 1;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.rh-dart {
  font-size: 12px;
  color: var(--cs-subtle);
  letter-spacing: 0.03em;
}

.rh-bust-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--cs-red);
}

.rh-total {
  font-size: 12px;
  color: var(--cs-subtle);
  font-weight: 700;
  text-align: right;
}

/* TransitionGroup */
.row-enter-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.row-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
