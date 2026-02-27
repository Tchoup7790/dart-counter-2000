<template>
  <div class="game-controls">
    <div class="controls-row">
      <!-- Annuler -->
      <button
        class="ctrl-btn danger"
        :disabled="props.currentThrows.length === 0"
        aria-label="Annuler le dernier lancer"
        @click="emit('undo')"
      >
        <span class="ctrl-icon">↩</span>
        <span class="ctrl-label">Annuler</span>
      </button>

      <!-- Récapitulatif volée -->
      <div class="throw-summary">
        <span
          v-for="(dart, i) in props.currentThrows"
          :key="`throw-${i}`"
          class="throw-badge"
          >{{ giveThrowLabel(dart) }}</span
        >
        <span
          class="throw-badge throw-badge--empty"
          v-for="n in 3 - props.currentThrows.length"
          :key="`empty-${n}`"
          >·</span
        >
      </div>

      <!-- Valider -->
      <button
        class="ctrl-btn"
        aria-label="Valider la volée"
        :disabled="props.currentThrows.length < 3"
        @click="emit('validate')"
      >
        <span class="ctrl-icon">✓</span>
        <span class="ctrl-label">Valider</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'

interface Props {
  activeTeamColor: string
  currentThrows: Array<DartThrow>
}

const props = withDefaults(defineProps<Props>(), {
  activeTeamColor: 'var(--cs-green)',
  currentThrows: () => [],
})

const emit = defineEmits<{
  (e: 'undo'): void
  (e: 'validate'): void
}>()

function giveThrowLabel(dart: DartThrow) {
  const prefix =
    dart.multiplier === 3
      ? 'T'
      : dart.multiplier === 2
        ? 'D'
        : ''
  const label =
    dart.sector === 50 || dart.sector === 25
      ? 'Bull'
      : String(dart.sector)
  return `${prefix}${label}`
}
</script>

<style scoped>
.game-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.throw-summary {
  display: flex;
  gap: 8px;
  align-items: center;
}

.throw-badge {
  padding: 6px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  border-color: var(--cs-muted);
  color: var(--cs-muted);
}

.throw-badge--empty {
  border-color: var(--cs-surface);
  color: var(--cs-text);
  opacity: 0.35;
}

/* Ligne principale */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

/* Boutons */
.ctrl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px auto;
}

.ctrl-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
  pointer-events: none;
}

.ctrl-icon {
  font-size: 20px;
  line-height: 1;
}
.ctrl-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
