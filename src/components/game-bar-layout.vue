<template>
  <div class="game-layout">
    <!-- Barre de statut -->
    <header class="game-bar">
      <div class="bar-left">
        <button
          class="btn-menu"
          @click="state.showMenu = true"
          aria-label="Menu"
        >
          ☰
        </button>
        <span class="mode-tag mode-tag-main">
          {{ props.modeName }}</span
        >
      </div>

      <div class="bar-center">
        <span class="round-label">Round</span>
        <span class="round-number">{{ props.roundNumber }}</span>
      </div>

      <div class="bar-right mode">
        <span
          class="turn-indicator"
          :style="{ color: props.activeTeamColor }"
        >
          {{ props.activeName }}
        </span>
        <div class="mode-options">
          <span
            class="mode-tag"
            v-for="(option, index) in props.options"
            :key="index"
            >{{ option }}</span
          >
        </div>
      </div>
    </header>

    <!-- Contenu de la vue -->
    <main class="game-content">
      <slot />
    </main>

    <!-- Menu pause -->
    <Transition name="menu">
      <div
        class="menu-overlay"
        v-if="state.showMenu"
        @click.self="state.showMenu = false"
      >
        <div class="menu-drawer">
          <div class="menu-header">
            <span class="menu-title">🎯 Partie en cours</span>
            <button
              class="btn-menu"
              @click="state.showMenu = false"
            >
              ✕
            </button>
          </div>
          <div class="menu-body">
            <button
              class="menu-item"
              @click="state.showMenu = false"
            >
              ▶ Reprendre
            </button>
            <button class="menu-item danger" @click="quitGame">
              🚪 Quitter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game.store'
import { reactive } from 'vue'

const props = defineProps<{
  activeName: string
  activeTeamColor: string
  roundNumber: number
  modeName: string
  options: string[]
}>()

const emit = defineEmits<{
  (e: 'quit'): void
}>()

const game = useGameStore()

function quitGame() {
  game.reset()
  emit('quit')
}

interface GameBarLayout {
  showMenu: boolean
}

const state: GameBarLayout = reactive({
  showMenu: false,
})
</script>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: visible;
}

/* Barre */
.game-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 15%, transparent);
  background: color-mix(
    in srgb,
    var(--cs-surface) 92%,
    transparent
  );
  backdrop-filter: blur(6px);
  position: sticky;
  top: 0;
  z-index: 10;
  height: 53px;
  box-sizing: border-box;
}

.bar-left,
.bar-right {
  display: flex;
  align-items: center;
  text-align: center;
  flex: 1;
  gap: 8px;
  min-width: 90px;
}
.bar-right {
  justify-content: flex-end;
}

.btn-menu {
  background: transparent;
  border: none;
  color: var(--cs-subtle);
  font-size: 18px;
  padding: 0 6px;
  text-align: center;
}
.btn-menu:hover {
  color: var(--cs-text);
  box-shadow: none;
}

.mode {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 4px;
}

.mode-options {
  display: flex;
  gap: 4px;
}

.mode-options > span {
  font-size: 8px;
}

.mode-tag {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cs-muted);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 25%, transparent);
  padding: 2px 5px;
  border-radius: 4px;
}

.mode-tag-main {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--cs-subtle);
  border-color: var(--cs-subtle);
}

.bar-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  line-height: 1;
}
.round-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cs-muted);
}
.round-number {
  font-size: 22px;
  font-weight: 700;
  color: var(--cs-text);
}

.turn-indicator {
  font-size: 12px;
  letter-spacing: 0.06em;
  font-weight: 700;
  text-align: right;
}

/* Contenu */
.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 12px;
}

/* Menu pause */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.menu-drawer {
  width: 100%;
  background: var(--cs-surface);
  border-top: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
  border-radius: 20px 20px 0 0;
  padding-bottom: 32px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 15%, transparent);
}
.menu-title {
  font-size: 15px;
  letter-spacing: 0.06em;
}

.menu-body {
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-item {
  text-align: left;
  padding: 16px 0;
  font-family: inherit;
}

/* Transitions menu */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s ease;
}
.menu-enter-active .menu-drawer,
.menu-leave-active .menu-drawer {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-from .menu-drawer,
.menu-leave-to .menu-drawer {
  transform: translateY(100%);
}
</style>
