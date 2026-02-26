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
          :style="{
            borderColor: props.activeTeamColor,
            color: props.activeTeamColor,
          }"
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
  gap: 12px;
  align-items: center;
}

.throw-badge {
  padding: 6px 10px;
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

/* Ligne principale */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* Boutons */
.ctrl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 82px;
  padding: 10px 20px;
  border-radius: var(--radius);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}

.ctrl-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
  pointer-events: none;
}

.ctrl-btn--undo {
  color: var(--cs-red);
  background: color-mix(
    in srgb,
    var(--cs-red) 8%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--cs-red) 20%, transparent);
}
.ctrl-btn--undo:not(:disabled):hover {
  background: color-mix(
    in srgb,
    var(--cs-red) 16%,
    var(--cs-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--cs-red) 45%,
    transparent
  );
}

.ctrl-btn--validate {
  color: var(--cs-green);
  background: color-mix(
    in srgb,
    var(--cs-green) 10%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--cs-green) 22%, transparent);
}
.ctrl-btn--validate:not(:disabled):hover {
  background: color-mix(
    in srgb,
    var(--cs-green) 20%,
    var(--cs-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--cs-green) 50%,
    transparent
  );
  box-shadow: 0 0 14px
    color-mix(in srgb, var(--cs-green) 15%, transparent);
}
.ctrl-btn--validate:not(:disabled):active {
  transform: scale(0.97);
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
