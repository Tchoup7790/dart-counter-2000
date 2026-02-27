<template>
  <div class="pad" :class="props.disabled ? 'disabled' : ''">
    <!-- Multiplicateurs -->
    <div class="mult-row">
      <button
        v-for="mult in [1, 2, 3] as const"
        :key="mult"
        class="pad-btn"
        :class="{
          'mult-btn--active-s':
            state.multiplier === mult && mult === 1,
          'mult-btn--active-d':
            state.multiplier === mult && mult === 2,
          'mult-btn--active-t':
            state.multiplier === mult && mult === 3,
        }"
        @click="setMultiplier(mult)"
      >
        {{
          mult === 1
            ? 'Single'
            : mult === 2
              ? 'Double'
              : 'Triple'
        }}
      </button>
    </div>

    <!-- Grille numéros -->
    <div class="num-grid">
      <template v-for="row in BOARD_GRID" :key="row.join()">
        <button
          v-for="n in row"
          :key="n"
          class="num-btn pad-btn"
          @click="hitNumber(n)"
        >
          {{ n }}
        </button>
      </template>
    </div>

    <!-- Bull -->
    <div class="bottom-row">
      <button
        class="bottom-btn -"
        :class="{
          'bottom-btn--disabled': state.multiplier === 3,
        }"
        :disabled="state.multiplier === 3"
        @click="hitBull()"
      >
        Bull
      </button>
      <button class="danger bottom-btn" @click="hitNumber(0)">
        Out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import { BOARD_GRID } from '@/utils/constantes'

const emit = defineEmits<{
  (e: 'dart-hit', dart: DartThrow): void
}>()

interface Props {
  disabled: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// State
interface DartboardPadState {
  multiplier: 1 | 2 | 3
}

const state: DartboardPadState = reactive({
  multiplier: 1,
})

function setMultiplier(m: 1 | 2 | 3) {
  if (!props.disabled) state.multiplier = m
}

// Handlers
function hitNumber(sector: number) {
  if (props.disabled) return
  const mult = sector === 0 ? 1 : state.multiplier
  emit('dart-hit', {
    sector,
    multiplier: mult,
    value: sector * mult,
  })
  state.multiplier = 1
}

function hitBull() {
  if (props.disabled || state.multiplier === 3) return
  const m = state.multiplier as 1 | 2
  const sector = m === 2 ? 50 : 25
  emit('dart-hit', {
    sector,
    multiplier: m,
    value: sector,
  })
  state.multiplier = 1
}
</script>

<style scoped>
.pad {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0 16px;
  width: 100%;
  box-sizing: border-box;
}

.pad.disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* Multiplicateurs */
.mult-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-bottom: 12px;
}

.pad-btn {
  font-size: 14px;
  font-weight: 900;
  border-color: color-mix(
    in srgb,
    var(--cs-muted) 20%,
    transparent
  );
  background: var(--cs-overlay);
  color: var(--cs-muted);
}

.mult-btn--active-s {
  background: color-mix(
    in srgb,
    var(--cs-text) 12%,
    var(--cs-surface)
  );
  border-color: var(--cs-text);
  color: var(--cs-text);
  box-shadow: 0 0 12px
    color-mix(in srgb, var(--cs-text) 15%, transparent);
}
.mult-btn--active-d {
  background: color-mix(
    in srgb,
    var(--cs-green) 12%,
    var(--cs-surface)
  );
  border-color: var(--cs-green);
  color: var(--cs-green);
  box-shadow: 0 0 12px
    color-mix(in srgb, var(--cs-green) 20%, transparent);
}
.mult-btn--active-t {
  background: color-mix(
    in srgb,
    var(--cs-red) 12%,
    var(--cs-surface)
  );
  border-color: var(--cs-red);
  color: var(--cs-red);
  box-shadow: 0 0 12px
    color-mix(in srgb, var(--cs-red) 20%, transparent);
}

/* Grille numéros */
.num-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding-bottom: 12px;
}

.num-btn {
  padding: 17px 0;
}

.num-btn:hover,
.num-btn:active {
  background: color-mix(
    in srgb,
    var(--cs-text) 10%,
    var(--cs-surface)
  );
  border-color: var(--cs-text);
  color: var(--cs-text);
}

/* Bull */
.bottom-row {
  display: flex;
  gap: 16px;
}

.bottom-btn {
  flex: 1;
  padding: 18px 0;

  font-size: 14px;
  font-weight: 900;
}

.bottom-btn--disabled,
.bottom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
