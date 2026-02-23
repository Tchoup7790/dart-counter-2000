<template>
  <div class="chip-selector">
    <span class="cs-label" v-if="label">{{ label }}</span>
    <div class="cs-chips">
      <button
        v-for="opt in options"
        :key="opt"
        class="cs-chip"
        :class="{ 'cs-chip--active': modelValue === opt }"
        type="button"
        @click="$emit('update:modelValue', opt)"
      >
        {{ opt }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number | string
  options: (number | string)[]
  label?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: number | string): void
}>()
</script>

<style scoped>
.chip-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cs-label {
  font-size: 11px;
  color: var(--cs-subtle);
  letter-spacing: 0.06em;
}

.cs-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cs-chip {
  padding: 5px 12px;
  font-size: 13px;
  font-family: inherit;
  background: var(--cs-overlay);
  color: var(--cs-subtle);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 30%, transparent);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition);
}

.cs-chip:hover {
  color: var(--cs-green);
  border-color: color-mix(
    in srgb,
    var(--cs-green) 40%,
    transparent
  );
}

.cs-chip--active {
  background: color-mix(
    in srgb,
    var(--cs-green) 15%,
    var(--cs-overlay)
  );
  color: var(--cs-green);
  border-color: color-mix(
    in srgb,
    var(--cs-green) 50%,
    transparent
  );
  box-shadow: 0 0 10px
    color-mix(in srgb, var(--cs-green) 15%, transparent);
}
</style>
