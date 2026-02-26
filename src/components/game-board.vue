<template>
  <div class="game-board">
    <!-- Cible -->
    <div class="board-area">
      <!-- Cible Pad -->
      <DartboardPad
        :disabled="
          props.currentThrows.length >= 3 || props.isBust
        "
        @dart-hit="emit('dart-thrown', $event)"
      />
    </div>

    <!-- Contrôles -->
    <GameControls
      :active-team-color="props.activeTeamColor"
      :current-throws="props.currentThrows"
      :is-bust="props.isBust"
      @undo="emit('undo')"
      @validate="emit('validate')"
    />
  </div>
</template>

<script setup lang="ts">
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import DartboardPad from './dartboard-pad.vue'
import GameControls from './game-controls.vue'

// Props
interface Props {
  activeTeamColor: string
  isBust: boolean
  currentThrows: Array<DartThrow>
}

const props = withDefaults(defineProps<Props>(), {
  activeTeamColor: 'var(--cs-green)',
  isBust: false,
  currentThrows: () => [],
})

// Emits
const emit = defineEmits<{
  (e: 'dart-thrown', dart: DartThrow): void
  (e: 'undo'): void
  (e: 'validate'): void
}>()
</script>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
}

.board-area {
  padding: 12px 12px 0;
}
</style>
