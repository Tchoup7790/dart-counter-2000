<script setup lang="ts">
/**
 * DartboardSVG.vue
 *
 * Cible SVG interactive.
 * - Numéros affichés dans la zone externe
 * - Labels S / T / D sur les anneaux
 * - Zones égales pour chaque secteur (S inner, T, S outer, D)
 * - Bull agrandi pour mobile
 */

import type { DartThrow } from '@/models/interfaces/dart-throw.interface'

const emit = defineEmits<{
  (e: 'dart-hit', dart: DartThrow): void
}>()

interface Props {
  disabled?: boolean
  activeColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  activeColor: 'var(--cs-green)',
})

// ─── Géométrie ────────────────────────────────────────────────────────────────

const SIZE = 400
const CX = SIZE / 2
const CY = SIZE / 2
const R_TOTAL = SIZE / 2 - 24 // marge pour les numéros

// Bull : 18% du rayon jouable
const R_DOUBLE_BULL = R_TOTAL * 0.09
const R_SINGLE_BULL = R_TOTAL * 0.18

// Les 4 bandes égales sur le reste
const R_PLAY = R_TOTAL - R_SINGLE_BULL
const BAND = R_PLAY / 4

const R0 = R_SINGLE_BULL // inner S thin
const R1 = R_SINGLE_BULL + BAND // inner Triple
const R2 = R_SINGLE_BULL + BAND * 2 // outer Triple / inner S fat
const R3 = R_SINGLE_BULL + BAND * 3 // inner Double
const R4 = R_TOTAL // outer Double

// Numéros : juste au-delà du double
const R_NUMS = R_TOTAL + 14

// Secteurs dans l'ordre horaire, 20 en haut
const SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9,
  12, 5,
]
const N = SECTORS.length
const ANGLE = (2 * Math.PI) / N
const OFFSET = -Math.PI / 2 - ANGLE / 2

// ─── Couleurs ────────────────────────────────────────────────────────────────

function colorSingle(i: number) {
  return i % 2 === 0 ? '#1c1c1c' : '#e8dfc8'
}
function colorScoring(i: number) {
  return i % 2 === 0 ? '#c0392b' : '#2ecc71'
}

// ─── SVG utils ───────────────────────────────────────────────────────────────

function polar(angle: number, r: number) {
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

function arc(
  r1: number,
  r2: number,
  a1: number,
  a2: number,
): string {
  const p1 = polar(a1, r1),
    p2 = polar(a2, r1)
  const p3 = polar(a2, r2),
    p4 = polar(a1, r2)
  const lg = a2 - a1 > Math.PI ? 1 : 0
  return `M${p1.x} ${p1.y} A${r1} ${r1} 0 ${lg} 1 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${r2} ${r2} 0 ${lg} 0 ${p4.x} ${p4.y}Z`
}

// ─── Segments ────────────────────────────────────────────────────────────────

interface Seg {
  path: string
  fill: string
  sector: number
  multiplier: 1 | 2 | 3
  value: number
  key: string
}

function buildSegments(): Seg[] {
  const out: Seg[] = []
  SECTORS.forEach((v, i) => {
    const a1 = OFFSET + i * ANGLE
    const a2 = a1 + ANGLE
    out.push({
      path: arc(R0, R1, a1, a2),
      fill: colorSingle(i),
      sector: v,
      multiplier: 1,
      value: v,
      key: `si-${i}`,
    })
    out.push({
      path: arc(R1, R2, a1, a2),
      fill: colorScoring(i),
      sector: v,
      multiplier: 3,
      value: v * 3,
      key: `tr-${i}`,
    })
    out.push({
      path: arc(R2, R3, a1, a2),
      fill: colorSingle(i),
      sector: v,
      multiplier: 1,
      value: v,
      key: `so-${i}`,
    })
    out.push({
      path: arc(R3, R4, a1, a2),
      fill: colorScoring(i),
      sector: v,
      multiplier: 2,
      value: v * 2,
      key: `db-${i}`,
    })
  })
  return out
}

const segments = buildSegments()

// ─── Labels S/T/D (un seul secteur référence, secteur 20) ───────────────────

// Position radiale du centre de chaque anneau pour le label
const labelAngle = OFFSET + ANGLE / 2 // angle du centre du secteur 20

function ringLabelPos(rInner: number, rOuter: number) {
  const r = (rInner + rOuter) / 2
  return {
    x: CX + r * Math.cos(labelAngle),
    y: CY + r * Math.sin(labelAngle),
  }
}

const labelS1 = ringLabelPos(R0, R1)
const labelT = ringLabelPos(R1, R2)
const labelS2 = ringLabelPos(R2, R3)
const labelD = ringLabelPos(R3, R4)

// ─── Numéros externes ────────────────────────────────────────────────────────

function numPos(i: number) {
  const a = OFFSET + (i + 0.5) * ANGLE
  return {
    x: CX + R_NUMS * Math.cos(a),
    y: CY + R_NUMS * Math.sin(a),
  }
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function hit(seg: Seg) {
  if (props.disabled) return
  emit('dart-hit', {
    sector: seg.sector,
    multiplier: seg.multiplier,
    value: seg.value,
    x: 0,
    y: 0,
  })
}

function hitBull(mul: 1 | 2) {
  if (props.disabled) return
  const sector = mul === 2 ? 50 : 25
  emit('dart-hit', {
    sector,
    multiplier: mul,
    value: sector,
    x: 0,
    y: 0,
  })
}
</script>

<template>
  <div class="dartboard-wrap" :class="{ disabled }">
    <svg
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      class="dartboard-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Fond -->
      <circle :cx="CX" :cy="CY" :r="R_TOTAL + 20" fill="#111" />

      <!-- Segments -->
      <path
        v-for="seg in segments"
        :key="seg.key"
        :d="seg.path"
        :fill="seg.fill"
        class="seg"
        @click="hit(seg)"
        @touchend.prevent="hit(seg)"
      />

      <!-- Fils -->
      <g
        stroke="#9a8870"
        stroke-width="0.7"
        fill="none"
        pointer-events="none"
      >
        <circle
          v-for="r in [R0, R1, R2, R3, R4]"
          :key="r"
          :cx="CX"
          :cy="CY"
          :r="r"
        />
        <line
          v-for="(_, i) in SECTORS"
          :key="`w${i}`"
          :x1="CX + R0 * Math.cos(OFFSET + i * ANGLE)"
          :y1="CY + R0 * Math.sin(OFFSET + i * ANGLE)"
          :x2="CX + R4 * Math.cos(OFFSET + i * ANGLE)"
          :y2="CY + R4 * Math.sin(OFFSET + i * ANGLE)"
        />
      </g>

      <!-- Bull simple -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_SINGLE_BULL"
        fill="#2ecc71"
        class="seg"
        @click="hitBull(1)"
        @touchend.prevent="hitBull(1)"
      />
      <!-- Double bull -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_DOUBLE_BULL"
        fill="#c0392b"
        class="seg"
        @click="hitBull(2)"
        @touchend.prevent="hitBull(2)"
      />

      <!-- Fil bull -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_SINGLE_BULL"
        fill="none"
        stroke="#9a8870"
        stroke-width="0.8"
        pointer-events="none"
      />
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_DOUBLE_BULL"
        fill="none"
        stroke="#9a8870"
        stroke-width="0.8"
        pointer-events="none"
      />

      <!-- Labels S / T / D sur le secteur 20 -->
      <g
        font-family="monospace"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="central"
        pointer-events="none"
      >
        <text
          :x="labelS1.x"
          :y="labelS1.y"
          font-size="9"
          fill="rgba(255,255,255,0.55)"
        >
          S
        </text>
        <text
          :x="labelT.x"
          :y="labelT.y"
          font-size="9"
          fill="rgba(255,255,255,0.9)"
        >
          T
        </text>
        <text
          :x="labelS2.x"
          :y="labelS2.y"
          font-size="9"
          fill="rgba(255,255,255,0.55)"
        >
          S
        </text>
        <text
          :x="labelD.x"
          :y="labelD.y"
          font-size="9"
          fill="rgba(255,255,255,0.9)"
        >
          D
        </text>
      </g>

      <!-- Numéros secteurs -->
      <g
        font-family="monospace"
        font-weight="700"
        font-size="13"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#e8dfc8"
        pointer-events="none"
      >
        <text
          v-for="(val, i) in SECTORS"
          :key="`n${i}`"
          :x="numPos(i).x"
          :y="numPos(i).y"
        >
          {{ val }}
        </text>
      </g>

      <!-- Voile disabled -->
      <circle
        v-if="disabled"
        :cx="CX"
        :cy="CY"
        :r="R_TOTAL + 20"
        fill="rgba(0,0,0,0.5)"
      />
    </svg>
  </div>
</template>

<style scoped>
.dartboard-wrap {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
}

.dartboard-svg {
  width: 100%;
  height: 100%;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.seg {
  cursor: pointer;
  transition: filter 0.1s;
}
.seg:active {
  filter: brightness(1.7);
}

@media (hover: hover) {
  .seg:hover {
    filter: brightness(1.3);
  }
}

.disabled .dartboard-svg {
  cursor: not-allowed;
}
</style>
