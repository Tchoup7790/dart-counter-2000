<template>
  <div class="atc-progress">
    <div
      v-for="(_, ti) in progressIndexes"
      :key="ti"
      class="atc-team"
      :class="{ 'atc-team--active': ti === activeTeam }"
      :style="{ '--tc': teamColors[ti] }"
    >
      <!-- En-tête -->
      <div class="atc-header">
        <span class="atc-name">{{ teamNames[ti] }}</span>
        <span class="atc-target">→ {{ currentTarget(ti) }}</span>
        <span class="atc-count"
          >{{ progressIndexes[ti] ?? 0 }}/{{
            sequence.length
          }}</span
        >
      </div>

      <!-- Barre de progression -->
      <div class="atc-track">
        <div
          class="atc-fill"
          :style="{ width: `${progressPct(ti)}%` }"
        />
      </div>

      <!-- Séquence de numéros -->
      <div class="atc-seq">
        <span
          v-for="(num, i) in sequence"
          :key="i"
          class="atc-num"
          :class="{
            'atc-num--done': i < (progressIndexes[ti] ?? 0),
            'atc-num--current': i === (progressIndexes[ti] ?? 0),
            'atc-num--future': i > (progressIndexes[ti] ?? 0),
          }"
          >{{ targetLabel(num) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progressIndexes: number[]
  sequence: number[]
  teamColors: string[]
  teamNames: string[]
  activeTeam: number
}

const props = defineProps<Props>()

function targetLabel(n: number): string {
  return n === 25 ? 'B' : String(n)
}

function currentTarget(ti: number): string {
  const idx = props.progressIndexes[ti] ?? 0
  if (idx >= props.sequence.length) return '🏆'
  const n = props.sequence[idx]!
  return n === 25 ? 'Bull' : String(n)
}

function progressPct(ti: number): number {
  const prog = props.progressIndexes[ti] ?? 0
  return Math.round((prog / props.sequence.length) * 100)
}
</script>

<style scoped>
.atc-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.atc-team {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: color-mix(
    in srgb,
    var(--tc) 5%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--tc) 14%, transparent);
  border-radius: var(--radius);
  transition:
    border-color 0.3s,
    background 0.3s,
    box-shadow 0.3s;
}

.atc-team--active {
  border-color: color-mix(in srgb, var(--tc) 50%, transparent);
  background: color-mix(
    in srgb,
    var(--tc) 10%,
    var(--cs-surface)
  );
  box-shadow: 0 0 14px
    color-mix(in srgb, var(--tc) 12%, transparent);
}

/* En-tête */
.atc-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.atc-name {
  flex: 1;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--tc);
}

.atc-target {
  font-size: 15px;
  font-weight: 700;
  color: var(--tc);
}

.atc-count {
  font-size: 10px;
  color: var(--cs-muted);
  letter-spacing: 0.05em;
}

/* Barre */
.atc-track {
  height: 3px;
  background: color-mix(
    in srgb,
    var(--tc) 15%,
    var(--cs-overlay)
  );
  border-radius: 2px;
  overflow: hidden;
}

.atc-fill {
  height: 100%;
  background: var(--tc);
  border-radius: 2px;
  box-shadow: 0 0 5px
    color-mix(in srgb, var(--tc) 60%, transparent);
  transition: width 0.4s ease;
}

/* Séquence */
.atc-seq {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.atc-num {
  font-size: 10px;
  min-width: 16px;
  text-align: center;
  padding: 2px 3px;
  border-radius: 3px;
  font-weight: 700;
  transition: all 0.2s;
}

.atc-num--done {
  color: color-mix(in srgb, var(--tc) 35%, var(--cs-muted));
  text-decoration: line-through;
  opacity: 0.4;
}

.atc-num--current {
  color: var(--cs-base);
  background: var(--tc);
  animation: pulse 1.3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 4px
      color-mix(in srgb, var(--tc) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 10px
      color-mix(in srgb, var(--tc) 80%, transparent);
  }
}

.atc-num--future {
  color: var(--cs-muted);
  opacity: 0.35;
}
</style>
