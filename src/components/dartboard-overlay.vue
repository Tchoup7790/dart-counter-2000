<template>
  <div class="dartboard-overlay" ref="containerRef">
    <!-- Web component -->
    <dartbot-dartboard
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

    <!-- Récapitulatif volée -->
    <div class="throw-summary">
      <span
        v-for="(label, i) in throwSummary"
        :key="`throw-${i}`"
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
        >·</span
      >
    </div>

    <!-- Voile désactivé -->
    <div class="dartboard-disabled-overlay" v-if="disabled" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  useDartboard,
  clickDetailToDart,
} from '@/composables/use-dartboard'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type { DartboardClickDetail } from '@/models/interfaces/board.interface'

// Props
interface Props {
  activeTeamColor?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeTeamColor: 'var(--cs-green)',
  disabled: false,
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
} = useDartboard(3)

// Ref DOM
const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const board = containerRef.value?.querySelector(
    'dartbot-dartboard',
  )
  board?.addEventListener(
    'dartboard-click',
    handleBoardHit as EventListener,
  )
})

onUnmounted(() => {
  const board = containerRef.value?.querySelector(
    'dartbot-dartboard',
  )
  board?.removeEventListener(
    'dartboard-click',
    handleBoardHit as EventListener,
  )
})

// Handler principal
function handleBoardHit(
  event: CustomEvent<DartboardClickDetail>,
) {
  if (props.disabled || isRoundComplete()) return

  const dart = clickDetailToDart(event.detail)
  if (!dart) return

  const added = addThrow(dart)
  if (!added) return

  emit('dart-thrown', dart)
}

// Exposition parent
defineExpose({
  /** Annule le dernier lancer */
  undoLastThrow,
  /** Valide manuellement la volée */
  forceCommit: () => emit('round-complete', commitRound()),
  /** Throws en cours (lecture) */
  currentThrows,
})

// Labels récap volée
const throwSummary = computed(() =>
  currentThrows.value.map((t) => {
    const prefix =
      t.multiplier === 3 ? 'T' : t.multiplier === 2 ? 'D' : ''
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

.throw-summary {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
}

.throw-badge {
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  min-width: 36px;
  text-align: center;
  transition: all 0.2s ease;
}
.throw-badge--empty {
  border-color: var(--cs-muted);
  color: var(--cs-muted);
  opacity: 0.35;
}

.dartboard-disabled-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: all;
  cursor: not-allowed;
}
</style>
