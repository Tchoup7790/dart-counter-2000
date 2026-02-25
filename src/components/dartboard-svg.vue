<template>
  <div
    class="dartboard-svg-wrapper"
    :class="{ 'dartboard-svg-wrapper--disabled': disabled }"
  >
    <svg
      class="dartboard-svg"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cible de fléchettes interactive"
    >
      <!-- Fond total -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_TOTAL + 4"
        fill="#0a0f0a"
      />

      <!-- Segments secteurs -->
      <path
        v-for="seg in segments"
        :key="seg.key"
        :d="seg.path"
        :fill="seg.fill"
        class="segment"
        :class="{
          'segment--double': seg.multiplier === 2,
          'segment--triple': seg.multiplier === 3,
        }"
        @click="onSegmentClick(seg)"
        @touchend.prevent="onSegmentClick(seg)"
      />

      <!-- Fils (séparateurs) -->
      <g
        class="wires"
        stroke="#b8a88a"
        stroke-width="0.8"
        fill="none"
        pointer-events="none"
      >
        <!-- Cercles radiaux -->
        <circle :cx="CX" :cy="CY" :r="R_INNER_SINGLE_OUT" />
        <circle :cx="CX" :cy="CY" :r="R_TRIPLE_IN" />
        <circle :cx="CX" :cy="CY" :r="R_TRIPLE_OUT" />
        <circle :cx="CX" :cy="CY" :r="R_OUTER_SINGLE_OUT" />
        <circle :cx="CX" :cy="CY" :r="R_DOUBLE_OUT" />

        <!-- Lignes radiales secteurs -->
        <line
          v-for="(_, i) in SECTORS"
          :key="`wire-${i}`"
          :x1="CX + R_BULL_OUTER * Math.cos(OFFSET + i * ANGLE)"
          :y1="CY + R_BULL_OUTER * Math.sin(OFFSET + i * ANGLE)"
          :x2="CX + R_DOUBLE_OUT * Math.cos(OFFSET + i * ANGLE)"
          :y2="CY + R_DOUBLE_OUT * Math.sin(OFFSET + i * ANGLE)"
        />
      </g>

      <!-- Bull simple (25) -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_BULL_OUTER"
        fill="#27ae60"
        class="segment segment--bull"
        @click="onBullClick(1)"
        @touchend.prevent="onBullClick(1)"
      />

      <!-- Double bull (50) -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_BULL_INNER"
        fill="#c0392b"
        class="segment segment--double-bull"
        @click="onBullClick(2)"
        @touchend.prevent="onBullClick(2)"
      />

      <!-- Fil bull -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_BULL_OUTER"
        fill="none"
        stroke="#b8a88a"
        stroke-width="1"
        pointer-events="none"
      />
      <circle
        :cx="CX"
        :cy="CY"
        :r="R_BULL_INNER"
        fill="none"
        stroke="#b8a88a"
        stroke-width="0.8"
        pointer-events="none"
      />
    </svg>

    <!-- Voile désactivé -->
    <div class="dartboard-disabled-overlay" v-if="disabled" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'

// Emits

const emit = defineEmits<{
  (e: 'dart-hit', dart: DartThrow): void
}>()

// Props

interface Props {
  disabled?: boolean
  activeColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  activeColor: 'var(--cs-green)',
})

// Constantes géométriques

const SIZE = 400 // viewBox size
const CX = SIZE / 2 // centre X
const CY = SIZE / 2 // centre Y
const R_TOTAL = SIZE / 2 - 4 // rayon total de la cible (marge de 4px)

// Bull : 20% du rayon
const R_BULL_OUTER = R_TOTAL * 0.17 // rayon bull simple
const R_BULL_INNER = R_TOTAL * 0.07 // rayon double bull

// Les 4 bandes radiales égales sur le reste du rayon
const R_PLAYABLE = R_TOTAL - R_BULL_OUTER
const BAND = R_PLAYABLE / 4

const R_INNER_SINGLE_OUT = R_BULL_OUTER // inner du thin single
const R_TRIPLE_IN = R_BULL_OUTER + BAND // inner du triple
const R_TRIPLE_OUT = R_BULL_OUTER + BAND * 1.75 // outer du triple
const R_OUTER_SINGLE_OUT = R_BULL_OUTER + BAND * 3.25 // inner du double
const R_DOUBLE_OUT = R_TOTAL // outer du double

// Secteurs
// Ordre horaire des secteurs, en commençant par 20 en haut
const SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9,
  12, 5,
]
const N = SECTORS.length // 20
const ANGLE = (2 * Math.PI) / N // angle par secteur en radians
const OFFSET = -Math.PI / 2 - ANGLE / 2 // rotation pour centrer le 20 en haut

// Couleurs réalistes

// Secteurs pairs / impairs → couleurs alternées
// Bands : single = noir/crème, double/triple = rouge/vert
function sectorColor(
  sectorIndex: number,
  band: 'single' | 'scoring',
): string {
  const isEven = sectorIndex % 2 === 0
  if (band === 'single') {
    return isEven ? '#1a1a1a' : '#e8dfc8'
  } else {
    return isEven ? '#c0392b' : '#27ae60'
  }
}

// Helpers SVG
function polarToCart(angle: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

/**
 * Génère le path d'un arc entre deux rayons et deux angles.
 */
function arcPath(
  r1: number,
  r2: number,
  aStart: number,
  aEnd: number,
): string {
  const p1 = polarToCart(aStart, r1)
  const p2 = polarToCart(aEnd, r1)
  const p3 = polarToCart(aEnd, r2)
  const p4 = polarToCart(aStart, r2)

  const largeArc = aEnd - aStart > Math.PI ? 1 : 0

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

// Génération des segments
interface Segment {
  path: string
  fill: string
  sector: number
  multiplier: 1 | 2 | 3
  value: number
  key: string
}

const segments = computed<Segment[]>(() => {
  const result: Segment[] = []

  SECTORS.forEach((value, i) => {
    const aStart = OFFSET + i * ANGLE
    const aEnd = aStart + ANGLE

    // Thin single (inner)
    result.push({
      path: arcPath(
        R_INNER_SINGLE_OUT,
        R_TRIPLE_IN,
        aStart,
        aEnd,
      ),
      fill: sectorColor(i, 'single'),
      sector: value,
      multiplier: 1,
      value,
      key: `s1-${i}`,
    })

    // Triple
    result.push({
      path: arcPath(R_TRIPLE_IN, R_TRIPLE_OUT, aStart, aEnd),
      fill: sectorColor(i, 'scoring'),
      sector: value,
      multiplier: 3,
      value: value * 3,
      key: `t-${i}`,
    })

    // Fat single (outer)
    result.push({
      path: arcPath(
        R_TRIPLE_OUT,
        R_OUTER_SINGLE_OUT,
        aStart,
        aEnd,
      ),
      fill: sectorColor(i, 'single'),
      sector: value,
      multiplier: 1,
      value,
      key: `s2-${i}`,
    })

    // Double
    result.push({
      path: arcPath(
        R_OUTER_SINGLE_OUT,
        R_DOUBLE_OUT,
        aStart,
        aEnd,
      ),
      fill: sectorColor(i, 'scoring'),
      sector: value,
      multiplier: 2,
      value: value * 2,
      key: `d-${i}`,
    })
  })

  return result
})

// Handlers
function onSegmentClick(seg: Segment) {
  if (props.disabled) return
  emit('dart-hit', {
    sector: seg.sector,
    multiplier: seg.multiplier,
    value: seg.value,
    x: 0,
    y: 0,
  })
}

function onBullClick(multiplier: 1 | 2) {
  if (props.disabled) return
  const sector = multiplier === 2 ? 50 : 25
  emit('dart-hit', {
    sector,
    multiplier,
    value: sector,
    x: 0,
    y: 0,
  })
}
</script>

<style scoped>
.dartboard-svg-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dartboard-svg {
  width: 100%;
  height: 100%;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Segments cliquables */
.segment {
  cursor: pointer;
  transition:
    filter 0.12s ease,
    opacity 0.12s ease;
}

.segment:active {
  filter: brightness(1.5);
}

/* Highlight au tap sur mobile */
@media (hover: none) {
  .segment:active {
    filter: brightness(1.8)
      drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
  }
}

/* Glow léger sur double et triple */
.segment--double:hover,
.segment--triple:hover {
  filter: brightness(1.25);
}

.segment--bull:active,
.segment--double-bull:active {
  filter: brightness(1.6);
}

/* Voile désactivé */
.dartboard-disabled-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  cursor: not-allowed;
}

/* Cible grisée quand disabled */
.dartboard-svg-wrapper--disabled .dartboard-svg {
  opacity: 0.45;
}
</style>
