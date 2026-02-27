<template>
  <div class="home" :class="state.visible ? 'visible' : ''">
    <!-- En-tête -->
    <header class="home-header">
      <h1 class="home-title">DART<span>COUNTER</span></h1>
      <h1 class="home-title">2000</h1>
      <p class="home-sub">Choisissez un mode de jeu</p>
    </header>

    <!-- Grille des modes -->
    <nav class="mode-grid">
      <button
        v-for="(mode, i) in modes"
        :key="mode.id"
        class="mode-card"
        :style="{
          '--accent': mode.color,
          '--delay': `${i * 80}ms`,
        }"
        :disabled="mode.id !== GameMode.X01"
        @click="select(mode.id)"
      >
        <span class="mode-icon">{{ mode.icon }}</span>
        <span class="mode-label">{{ mode.label }}</span>
        <span class="mode-sub">{{ mode.sub }}</span>
        <span class="mode-arrow">→</span>
      </button>
    </nav>

    <!-- Pied de page -->
    <footer class="home-footer">
      <span>DARTCOUNTER v1.0</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { GameMode } from '@/models/enums/game-mode.enum'
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface HomeViewState {
  visible: boolean
}

const state: HomeViewState = reactive({
  visible: false,
})

onMounted(() => setTimeout(() => (state.visible = true), 50))

const modes: {
  id: GameMode
  label: string
  sub: string
  icon: string
  color: string
}[] = [
  {
    id: GameMode.X01,
    label: 'X01',
    sub: '301 · 501 · 701 · 1001',
    icon: '🎯',
    color: 'var(--cs-green)',
  },
  {
    id: GameMode.TWO_HUNDRED_TWENTY_ONE,
    label: '221',
    sub: 'Course aux points',
    icon: '⬆️',
    color: 'var(--cs-yellow)',
  },
  {
    id: GameMode.CRICKET,
    label: 'Cricket',
    sub: 'Standard · Crazy · Cut-Throat',
    icon: '🏏',
    color: 'var(--cs-red)',
  },
  {
    id: GameMode.ATC,
    label: 'Around the Clock',
    sub: '1 → 20 → Bull',
    icon: '🕐',
    color: 'var(--cs-cyan)',
  },
]

function select(mode: GameMode) {
  router.push({ name: 'setup', params: { mode } })
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 24px;
  gap: 48px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.home.visible {
  opacity: 1;
}

/* Header */
.home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 86px;
  gap: 8px;
  animation: slideDown 0.5s ease both;
}

@keyframes pulse {
  0%,
  100% {
    filter: drop-shadow(
      0 0 12px color-mix(in srgb, var(--cs-red) 50%, transparent)
    );
  }
  50% {
    filter: drop-shadow(
      0 0 28px color-mix(in srgb, var(--cs-red) 80%, transparent)
    );
  }
}

.home-title {
  margin: 0;
  font-size: 36px;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: var(--cs-text);
  line-height: 1;
}

.home-title span {
  color: var(--cs-green);
  text-shadow: 0 0 20px
    color-mix(in srgb, var(--cs-green) 60%, transparent);
}

.home-sub {
  margin: 0;
  font-size: 11px;
  color: var(--cs-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* Grille */
.mode-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.mode-card {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    'icon label arrow'
    'icon sub   arrow';
  align-items: center;
  gap: 0 12px;

  padding: 16px 18px;
  background: color-mix(
    in srgb,
    var(--accent) 6%,
    var(--cs-surface)
  );
  border: 1.5px solid
    color-mix(in srgb, var(--accent) 18%, transparent);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;

  animation: slideUp 0.45s ease both;
  animation-delay: var(--delay);
  transition:
    background var(--transition),
    border-color var(--transition),
    transform 0.15s ease,
    box-shadow var(--transition);
}

.mode-card:hover {
  background: color-mix(
    in srgb,
    var(--accent) 12%,
    var(--cs-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--accent) 45%,
    transparent
  );
  box-shadow: 0 0 20px
    color-mix(in srgb, var(--accent) 12%, transparent);
  transform: translateX(3px);
}
.mode-card:active {
  transform: translateX(1px) scale(0.99);
}

.mode-card:disabled,
.mode-card.mode-card:disabled > * {
  opacity: 0.28;
  cursor: not-allowed;
  pointer-events: none;
}

.mode-icon {
  grid-area: icon;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-label {
  grid-area: label;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent);
}

.mode-sub {
  grid-area: sub;
  font-size: 10px;
  color: var(--cs-muted);
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.mode-arrow {
  grid-area: arrow;
  font-size: 18px;
  color: color-mix(in srgb, var(--accent) 50%, transparent);
  transition:
    transform var(--transition),
    color var(--transition);
}
.mode-card:hover .mode-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* Footer */
.home-footer {
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cs-muted);
  opacity: 0.5;
  padding-bottom: 12px;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
