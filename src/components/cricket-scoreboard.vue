<template>
  <div class="cricket-board">
    <!-- ── Scores ── -->
    <div class="cb-scores">
      <div
        class="cb-team-score"
        :class="{ 'cb-team-score--active': activeTeam === 0 }"
        :style="{ '--tc': teamColors[0] }"
      >
        <span class="cb-team-name">{{ teamNames[0] }}</span>
        <span class="cb-bonus">{{ bonusPoints[0] ?? 0 }}</span>
      </div>

      <div class="cb-sector-labels">
        <span
          v-for="ss in sectorStates"
          :key="ss.sector"
          class="cb-sector-label"
          :class="{ 'cb-sector-label--done': ss.isComplete }"
          >{{ sectorLabel(ss.sector) }}</span
        >
      </div>

      <div
        class="cb-team-score cb-team-score--right"
        :class="{ 'cb-team-score--active': activeTeam === 1 }"
        :style="{ '--tc': teamColors[1] }"
      >
        <span class="cb-team-name">{{ teamNames[1] }}</span>
        <span class="cb-bonus">{{ bonusPoints[1] ?? 0 }}</span>
      </div>
    </div>

    <!-- ── Croix ── -->
    <div class="cb-crosses">
      <!-- Équipe 0 -->
      <div
        class="cb-cross-row"
        :style="{ '--tc': teamColors[0] }"
      >
        <div
          class="cb-cell"
          v-for="ss in sectorStates"
          :key="ss.sector"
        >
          <CrossMark
            :hits="ss.hitsPerTeam[0] ?? 0"
            :faded="ss.isComplete"
          />
        </div>
      </div>

      <!-- Tirets centraux -->
      <div class="cb-dividers">
        <div
          class="cb-divider"
          :class="{ 'cb-divider--done': ss.isComplete }"
          v-for="ss in sectorStates"
          :key="ss.sector"
        />
      </div>

      <!-- Équipe 1 -->
      <div
        class="cb-cross-row"
        :style="{ '--tc': teamColors[1] }"
      >
        <div
          class="cb-cell"
          v-for="ss in sectorStates"
          :key="ss.sector"
        >
          <CrossMark
            :hits="ss.hitsPerTeam[1] ?? 0"
            :faded="ss.isComplete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SectorState {
  sector: number
  hitsPerTeam: number[] // index = teamIndex, valeur = 0|1|2|3
  isComplete: boolean
}

interface Props {
  sectors: number[]
  sectorStates: SectorState[]
  bonusPoints: number[]
  teamColors: string[]
  teamNames: string[]
  activeTeam: number
}

defineProps<Props>()

function sectorLabel(s: number): string {
  return s === 25 ? 'B' : String(s)
}
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'

export const CrossMark = defineComponent({
  name: 'CrossMark',
  props: {
    hits: { type: Number, required: true },
    faded: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const s = {
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      }
      const nodes = []

      if (props.hits === 0) {
        nodes.push(
          h('circle', {
            cx: 12,
            cy: 12,
            r: 7,
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.2',
            opacity: '0.2',
          }),
        )
      }
      if (props.hits >= 1)
        nodes.push(
          h('line', { x1: 6, y1: 18, x2: 18, y2: 6, ...s }),
        )
      if (props.hits >= 2)
        nodes.push(
          h('line', { x1: 6, y1: 6, x2: 18, y2: 18, ...s }),
        )
      if (props.hits >= 3)
        nodes.push(
          h('circle', {
            cx: 12,
            cy: 12,
            r: 9,
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
          }),
        )

      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: 22,
          height: 22,
          class: [
            'cross-svg',
            props.faded && 'cross-svg--faded',
          ],
        },
        nodes,
      )
    }
  },
})
</script>

<style scoped>
.cricket-board {
  width: 100%;
  background: var(--cs-surface);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 18%, transparent);
  border-radius: var(--radius);
  overflow: hidden;
}

/* Scores */
.cb-scores {
  display: grid;
  grid-template-columns: 72px 1fr 72px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 12%, transparent);
}

.cb-team-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px 10px;
  transition: background 0.3s;
}
.cb-team-score--right {
  align-items: flex-start;
}
.cb-team-score--active {
  background: color-mix(in srgb, var(--tc) 10%, transparent);
}

.cb-team-name {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--tc);
}
.cb-bonus {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--tc);
}

.cb-sector-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
}
.cb-sector-label {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--cs-subtle);
  padding: 6px 0 4px;
  transition:
    color 0.3s,
    opacity 0.3s;
}
.cb-sector-label--done {
  color: var(--cs-muted);
  text-decoration: line-through;
  opacity: 0.4;
}

/* Croix */
.cb-crosses {
  display: grid;
  grid-template-columns: 72px 1fr 72px;
  padding: 4px 0 6px;
}

.cb-cross-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  color: var(--tc);
}

.cb-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
}

.cb-dividers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
  padding: 0 2px;
}
.cb-divider {
  height: 2px;
  margin: 0 2px;
  background: color-mix(
    in srgb,
    var(--cs-muted) 15%,
    transparent
  );
  border-radius: 1px;
  transition: background 0.3s;
}
.cb-divider--done {
  background: color-mix(
    in srgb,
    var(--cs-green) 35%,
    transparent
  );
}

:deep(.cross-svg) {
  display: block;
  transition: opacity 0.2s;
}
:deep(.cross-svg--faded) {
  opacity: 0.28;
}
</style>
