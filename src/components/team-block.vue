<template>
  <div class="team-block" :style="{ color }">
    <!-- En-tête : nom + bouton ajouter -->
    <div class="team-header">
      <span class="team-name">{{ teamName }}</span>
      <button
        class="btn-add"
        :disabled="players.length >= maxPlayers"
        @click="emit('add-player')"
      >
        + Joueur
      </button>
    </div>

    <!-- Liste des joueurs -->
    <TransitionGroup name="player" tag="div" class="player-list">
      <div
        v-for="(player, pi) in players"
        :key="player.id"
        class="player-row"
      >
        <!-- Pastille couleur -->
        <span
          class="player-dot"
          :style="{ background: player.color }"
        />

        <!-- Nom éditable -->
        <input
          class="player-input"
          :class="{
            'player-input--editing':
              state.editingId === player.id,
          }"
          :value="player.name"
          :placeholder="`Joueur ${pi + 1}`"
          maxlength="20"
          @focus="state.editingId = player.id"
          @blur="state.editingId = undefined"
          @input="
            emit(
              'update-name',
              pi,
              ($event.target as HTMLInputElement).value,
            )
          "
        />

        <!-- Supprimer -->
        <button
          class="btn-remove"
          :disabled="players.length <= 1"
          title="Supprimer ce joueur"
          @click="emit('remove-player', pi)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@/models/interfaces/player.interface'
import { reactive } from 'vue'

interface Props {
  teamName: string
  color: string
  players: Player[]
  maxPlayers?: number
}

withDefaults(defineProps<Props>(), { maxPlayers: 4 })

interface TeamBlockState {
  editingId: string | undefined
}

const state: TeamBlockState = reactive({
  editingId: undefined,
})

const emit = defineEmits<{
  (e: 'add-player'): void
  (e: 'remove-player', index: number): void
  (e: 'update-name', index: number, value: string): void
}>()
</script>

<style scoped>
.team-block {
  background: color-mix(
    in srgb,
    var(--tc) 5%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--tc) 20%, transparent);
  border-radius: var(--radius);
  overflow: hidden;
}

/* En-tête */
.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--tc) 8%, transparent);
  border-bottom: 1px solid
    color-mix(in srgb, var(--tc) 14%, transparent);
}

.team-name {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tc);
}

.btn-add {
  font-size: 11px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--tc) 12%, transparent);
  color: var(--tc);
  border: 1px solid
    color-mix(in srgb, var(--tc) 30%, transparent);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition);
}
.btn-add:hover {
  background: color-mix(in srgb, var(--tc) 22%, transparent);
}
.btn-add:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Liste joueurs */
.player-list {
  display: flex;
  flex-direction: column;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 10%, transparent);
}
.player-row:last-child {
  border-bottom: none;
}

/* Pastille */
.player-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Input nom */
.player-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  padding: 2px 4px;
  font-size: 14px;
  font-family: inherit;
  color: var(--cs-text);
  outline: none;
  border-radius: 0;
  transition:
    border-color var(--transition),
    background var(--transition);
}

.player-input--editing,
.player-input:focus {
  border-bottom-color: var(--tc);
  background: color-mix(in srgb, var(--tc) 5%, transparent);
  border-radius: 4px 4px 0 0;
}

.player-input::placeholder {
  color: var(--cs-muted);
}

/* Supprimer */
.btn-remove {
  background: transparent;
  border: none;
  color: var(--cs-muted);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    color var(--transition),
    background var(--transition);
}
.btn-remove:hover {
  color: var(--cs-red);
  background: color-mix(in srgb, var(--cs-red) 10%, transparent);
}
.btn-remove:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

/* TransitionGroup */
.player-enter-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.player-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
  position: absolute;
  width: 100%;
}
.player-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.player-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
