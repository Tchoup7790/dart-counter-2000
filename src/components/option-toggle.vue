<template>
  <label class="option-toggle">
    <div class="ot-text">
      <span class="ot-label">{{ label }}</span>
      <span class="ot-desc" v-if="description">{{
        description
      }}</span>
    </div>

    <div
      class="ot-track"
      :class="{ 'ot-track--on': modelValue }"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <div class="ot-thumb" />
    </div>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  description?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped>
.option-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--cs-surface);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background var(--transition);
}
.option-toggle:hover {
  background: var(--cs-overlay);
}

/* Texte */
.ot-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ot-label {
  font-size: 14px;
  color: var(--cs-text);
}

.ot-desc {
  font-size: 10px;
  color: var(--cs-muted);
  letter-spacing: 0.04em;
}

/* Track */
.ot-track {
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--cs-overlay);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 30%, transparent);
  position: relative;
  transition:
    background 0.3s,
    border-color 0.3s;
}

.ot-track--on {
  background: color-mix(
    in srgb,
    var(--cs-green) 25%,
    var(--cs-overlay)
  );
  border-color: color-mix(
    in srgb,
    var(--cs-green) 50%,
    transparent
  );
}

/* Thumb */
.ot-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--cs-muted);
  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.ot-track--on .ot-thumb {
  transform: translateX(18px);
  background: var(--cs-green);
}
</style>
