<template>
  <div class="game-controls">
    <!-- Hint checkout X01 -->
    <Transition name="hint">
      <div class="checkout-hint" v-if="checkout">
        <span class="hint-label">Checkout</span>
        <span class="hint-value">{{ checkout }}</span>
      </div>
    </Transition>

    <div class="controls-row">
      <!-- Annuler -->
      <button
        class="ctrl-btn ctrl-btn--undo"
        :disabled="throwCount === 0"
        aria-label="Annuler le dernier lancer"
        @click="emit('undo')"
      >
        <span class="ctrl-icon">↩</span>
        <span class="ctrl-label">Annuler</span>
      </button>

      <!-- Compteur de fléchettes -->
      <div class="throw-dots" aria-label="Fléchettes lancées">
        <div
          v-for="n in 3"
          :key="n"
          class="dot"
          :class="{ 'dot--on': n <= throwCount }"
          :style="
            n <= throwCount
              ? {
                  background: activeColor,
                  boxShadow: `0 0 7px ${activeColor}`,
                }
              : {}
          "
        />
      </div>

      <!-- Valider -->
      <button
        class="ctrl-btn ctrl-btn--validate"
        :style="{ '--tc': activeColor }"
        :disabled="!canValidate"
        aria-label="Valider la volée"
        @click="emit('validate')"
      >
        <span class="ctrl-icon">✓</span>
        <span class="ctrl-label">Valider</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  throwCount: number
  activeColor: string
  canValidate?: boolean
  checkout?: string
}

withDefaults(defineProps<Props>(), {
  canValidate: false,
})

const emit = defineEmits<{
  (e: 'undo'): void
  (e: 'validate'): void
}>()
</script>

<style scoped>
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 20px 28px;
}

/* Checkout hint */
.checkout-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 7px 14px;
  background: color-mix(
    in srgb,
    var(--cs-green) 8%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--cs-green) 22%, transparent);
  border-radius: 8px;
}

.hint-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cs-muted);
}

.hint-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--cs-green);
  letter-spacing: 0.08em;
}

.hint-enter-active,
.hint-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  color: var(--tc);
  background: color-mix(
    in srgb,
    var(--tc) 10%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--tc) 22%, transparent);
}
.ctrl-btn--validate:not(:disabled):hover {
  background: color-mix(
    in srgb,
    var(--tc) 20%,
    var(--cs-surface)
  );
  border-color: color-mix(in srgb, var(--tc) 50%, transparent);
  box-shadow: 0 0 14px
    color-mix(in srgb, var(--tc) 15%, transparent);
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

/* Dots */
.throw-dots {
  display: flex;
  gap: 9px;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cs-overlay);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 25%, transparent);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.dot--on {
  transform: scale(1.2);
  border-color: transparent;
}
</style>
