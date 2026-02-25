<script setup lang="ts">
/**
 * DartboardOverlay.vue
 *
 * Wrapper autour de DartboardSVG.
 * Gère la logique de volée (3 lancers max, récap badges, undo/commit).
 *
 * Émit :
 *   dart-thrown    → chaque lancer individuel
 *   round-complete → quand forceCommit() est appelé (bouton Valider)
 */

import { computed } from 'vue'
import { useDartboard } from '@/composables/use-dartboard'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import DartboardSvg from './dartboard-svg.vue'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  activeTeamColor?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeTeamColor: 'var(--cs-green)',
  disabled: false,
})

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'dart-thrown', dart: DartThrow): void
  (e: 'round-complete', throws: DartThrow[]): void
}>()

// ─── Composable ──────────────────────────────────────────────────────────────

const {
  currentThrows,
  isRoundComplete,
  addThrow,
  commitRound,
  undoLastThrow,
} = useDartboard(3)

// ─── Handler ─────────────────────────────────────────────────────────────────

function onDartHit(dart: DartThrow) {
  if (props.disabled || isRoundComplete()) return

  const added = addThrow(dart)
  if (!added) return

  emit('dart-thrown', dart)
}

// ─── Exposition parent ────────────────────────────────────────────────────────

defineExpose({
  undoLastThrow,
  forceCommit: () => emit('round-complete', commitRound()),
  currentThrows,
})

// ─── Labels récap volée ───────────────────────────────────────────────────────

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

<template>
  <div class="dartboard-overlay">
    <!-- Cible SVG -->
    <DartboardSvg
      :disabled="disabled"
      :active-color="activeTeamColor"
      @dart-hit="onDartHit"
    />

    <!-- Récapitulatif volée -->
    <div class="throw-summary">
      <TransitionGroup name="badge">
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
      </TransitionGroup>
      <span
        class="throw-badge throw-badge--empty"
        v-for="n in 3 - currentThrows.length"
        :key="`empty-${n}`"
        >·</span
      >
    </div>
  </div>
</template>

<style scoped>
.dartboard-overlay {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.throw-summary {
  display: flex;
  gap: 6px;
  align-items: center;
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
}

.throw-badge--empty {
  border-color: var(--cs-muted);
  color: var(--cs-muted);
  opacity: 0.35;
}

.badge-enter-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.badge-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
