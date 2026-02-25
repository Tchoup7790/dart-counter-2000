<template>
  <div class="round-history" v-if="rounds.length">
    <p class="rh-title">Historique</p>
    <TransitionGroup name="row" tag="div" class="rh-list">
      <div
        v-for="(round, i) in visible"
        :key="`${round.team}-${i}`"
        class="rh-row"
        :class="{ 'rh-row--bust': isBust(round) }"
        :style="{
          '--tc': teamColors[round.team] ?? 'var(--cs-muted)',
        }"
      >
        <span class="rh-dot" />

        <div class="rh-throws">
          <span v-if="isBust(round)" class="rh-bust-label"
            >BUST</span
          >
          <template v-else>
            <span
              v-for="(dart, j) in round.throws"
              :key="j"
              class="rh-dart"
              :class="{
                'rh-dart--double': dart.multiplier === 2,
                'rh-dart--triple': dart.multiplier === 3,
                'rh-dart--bull': dart.sector === 50,
                'rh-dart--single-bull': dart.sector === 25,
              }"
              >{{ label(dart) }}</span
            >
          </template>
        </div>

        <span class="rh-total" v-if="!isBust(round)">{{
          total(round)
        }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DartThrow {
  sector: number
  multiplier: number
  value: number
}

interface Round {
  team: number
  throws: DartThrow[]
}

interface Props {
  rounds: Round[]
  teamColors: string[]
  teamNames: string[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 5,
})

const visible = computed(() =>
  [...props.rounds].reverse().slice(0, props.maxVisible),
)

function isBust(r: Round): boolean {
  return r.throws.length === 0
}

function total(r: Round): number {
  return r.throws.reduce((s, t) => s + t.value, 0)
}

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
}

.rh-title {
  margin: 0;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cs-muted);
  padding: 0 2px;
}

.rh-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rh-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--cs-surface);
  border-left: 2px solid var(--tc);
  border-radius: 7px;
}

.rh-row--bust {
  border-left-color: var(--cs-red);
  background: color-mix(
    in srgb,
    var(--cs-red) 4%,
    var(--cs-surface)
  );
}

.rh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tc);
  flex-shrink: 0;
}
.rh-row--bust .rh-dot {
  background: var(--cs-red);
}

.rh-throws {
  flex: 1;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.rh-dart {
  font-size: 11px;
  color: var(--cs-subtle);
  letter-spacing: 0.03em;
}
.rh-dart--double {
  color: var(--cs-cyan);
  font-weight: 700;
}
.rh-dart--triple {
  color: var(--cs-yellow);
  font-weight: 700;
}

.rh-dart--single-bull {
  font-weight: 700;
}

.rh-dart--bull {
  color: var(--cs-red);
  font-weight: 700;
}
.rh-bust-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--cs-red);
}

.rh-total {
  font-size: 13px;
  font-weight: 700;
  color: var(--cs-text);
  min-width: 26px;
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
