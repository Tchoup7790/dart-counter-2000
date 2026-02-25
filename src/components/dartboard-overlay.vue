<template>
  <div class="dartboard-overlay" ref="containerRef">
    <!-- Web component officiel @dartbot/dartboard -->
    <dartbot-dartboard
      ref="boardRef"
      class="dartboard"
      :class="{ 'dartboard--disabled': disabled }"
      style="
        --dartboard-board-bg: #0a0f0a;
        --dartboard-sector-bg-1: #111;
        --dartboard-sector-bg-2: #e8dfc8;
        --dartboard-sector-bg-3: #c0392b;
        --dartboard-sector-bg-4: #27ae60;
        --dartboard-wire-color: #b8a88a;
        --dartboard-wire-shadow-show: 1;
        --dartboard-zoom: 2.4;
      "
    />

    <!-- SVG overlay : fléchettes -->
    <svg
      class="darts-svg"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <defs>
        <!-- Lueur pour les fléchettes actives -->
        <filter id="dart-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g v-for="dot in allDots" :key="dot.key">
        <!-- Ombre portée -->
        <circle
          :cx="dot.cx + 1"
          :cy="dot.cy + 1"
          r="5"
          fill="rgba(0,0,0,0.5)"
          :opacity="dot.opacity"
        />
        <!-- Corps de la fléchette -->
        <circle
          :cx="dot.cx"
          :cy="dot.cy"
          r="5"
          :fill="dot.color"
          :opacity="dot.opacity"
          :filter="
            dot.opacity === 1 ? 'url(#dart-glow)' : undefined
          "
        />
        <!-- Contour blanc -->
        <circle
          :cx="dot.cx"
          :cy="dot.cy"
          r="5"
          fill="none"
          stroke="white"
          stroke-width="1"
          :opacity="dot.opacity * 0.6"
        />
        <!-- Label ×2 / ×3 -->
        <text
          v-if="dot.label"
          :x="dot.cx + 7"
          :y="dot.cy + 4"
          font-family="monospace"
          font-size="9"
          fill="white"
          :opacity="dot.opacity"
        >
          {{ dot.label }}
        </text>
      </g>
    </svg>

    <!-- Récapitulatif de la volée -->
    <div class="throw-summary" v-if="currentThrows.length > 0">
      <span
        v-for="(label, i) in throwSummary"
        :key="i"
        class="throw-badge"
        :style="{
          borderColor: activeTeamColor,
          color: activeTeamColor,
        }"
        >{{ label }}</span
      >
      <span
        class="throw-badge throw-badge--empty"
        v-for="n in 3 - currentThrows.length"
        :key="`empty-${n}`"
      >
        ·
      </span>
    </div>

    <!-- Overlay désactivé -->
    <div class="dartboard-disabled-overlay" v-if="disabled" />
  </div>
</template>

<script setup lang="ts">
import { useDartboard } from '@/composables/use-dartboard'
import type {
  DartThrow,
  PlacedDart,
} from '@/models/interfaces/dart-throw.interface'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  activeTeamColor?: string
  historicDarts?: PlacedDart[]
  disabled?: boolean
  hideLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeTeamColor: 'var(--cs-gold)',
  historicDarts: () => [],
  disabled: false,
  hideLabels: false,
})

// Emits
const emit = defineEmits<{
  (e: 'dart-thrown', dart: DartThrow): void
  (e: 'round-complete', throws: DartThrow[]): void
}>()

// Composable
const {
  currentThrows,
  isRoundComplete,
  addThrow,
  commitRound,
  undoLastThrow,
  normalizedToPixel,
} = useDartboard(3)

// Ref sur le web component
const containerRef = ref<HTMLElement | null>(null)
const containerSize = ref(400)

// Taille du conteneur pour convertir les coords normalisées → pixels SVG
const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0]
  if (entry) containerSize.value = entry.contentRect.width
})

onMounted(() => {
  if (containerRef.value)
    resizeObserver.observe(containerRef.value)

  const board = containerRef.value?.querySelector(
    'dartbot-dartboard',
  )
  board?.addEventListener(
    'dartboard-click',
    handleBoardHit as EventListener,
  )
})

onUnmounted(() => {
  resizeObserver.disconnect()
  const board = containerRef.value?.querySelector(
    'dartbot-dartboard',
  )
  board?.removeEventListener(
    'dartboard-click',
    handleBoardHit as EventListener,
  )
})

interface DartboardClickDetail {
  sector: number
  ring: number
  point: { x: number; y: number }
}

const BOARD_SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9,
  12, 5,
]

// Handler
function handleBoardHit(
  event: CustomEvent<DartboardClickDetail>,
) {
  if (props.disabled || isRoundComplete()) return

  const { sector, ring, point } = event.detail

  if (ring === 0) return // miss

  // sector est un index, pas une valeur directe
  let realSector: number
  let multiplier: 1 | 2 | 3 = 1

  if (ring === undefined) {
    realSector = 0
    multiplier = 1
  } else if (ring === 1) {
    realSector = 25
    multiplier = 1
  } else if (ring === 0) {
    realSector = 50
    multiplier = 1
  } else {
    realSector = BOARD_SECTORS[sector]!
    multiplier = ring === 3 ? 3 : ring === 5 ? 2 : 1
  }

  const dart: DartThrow = {
    sector: realSector,
    multiplier,
    value: realSector * multiplier,
    x: point.x,
    y: point.y,
  }

  const added = addThrow(dart)
  if (!added) return
  emit('dart-thrown', dart)
  if (isRoundComplete()) {
    setTimeout(() => emit('round-complete', commitRound()), 0)
  }
}

// Exposition pour usage parent
defineExpose({
  /** Annule le dernier lancer (appeler depuis le parent) */
  undoLastThrow,
  /** Valide manuellement la volée avant 3 fléchettes */
  forceCommit: () => emit('round-complete', commitRound()),
  /** Accès aux throws en cours */
  currentThrows,
})

// Calcul positions SVG des fléchettes

const size = computed(() => containerSize.value)

interface DartDot {
  cx: number
  cy: number
  color: string
  opacity: number
  label?: string
  key: string
}

const currentDots = computed<DartDot[]>(() =>
  currentThrows.map((t, i) => {
    const { px, py } = normalizedToPixel(t.x, t.y, size.value)
    return {
      cx: px,
      cy: py,
      color: props.activeTeamColor,
      opacity: 1,
      label: t.multiplier > 1 ? `×${t.multiplier}` : undefined,
      key: `current-${i}`,
    }
  }),
)

const historicDots = computed<DartDot[]>(() =>
  props.historicDarts.map((d, i) => {
    const { px, py } = normalizedToPixel(
      d.throw.x,
      d.throw.y,
      size.value,
    )
    return {
      cx: px,
      cy: py,
      color: d.playerColor,
      opacity: 0.4,
      key: `historic-${i}`,
    }
  }),
)

const allDots = computed(() => [
  ...historicDots.value,
  ...currentDots.value,
])

// Labels de la volée courante

const throwSummary = computed(() =>
  currentThrows.map((t) => {
    const prefix =
      t.multiplier === 2 ? 'D' : t.multiplier === 3 ? 'T' : ''
    const label =
      t.sector === 50
        ? 'Bull'
        : t.sector === 25
          ? 'S-Bull'
          : String(t.sector)
    return `${prefix}${label}`
  }),
)
</script>

<style scoped>
.dartboard-overlay {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Web component : occupe tout le conteneur */
.dartboard {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  transition: opacity var(--transition);
}

.dartboard--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* SVG superposé, exactement au-dessus de la cible */
.darts-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Récap de la volée */
.throw-summary {
  position: absolute;
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  align-items: center;
}

.throw-badge {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  min-width: 32px;
  text-align: center;
}

.throw-badge--empty {
  border-color: var(--cs-muted);
  color: var(--cs-muted);
  opacity: 0.4;
}

/* Voile de désactivation */
.dartboard-disabled-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: all;
  cursor: not-allowed;
}
</style>
