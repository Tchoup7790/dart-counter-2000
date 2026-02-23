<script setup lang="ts">
import type DartboardOverlay from '@/components/dartboard-overlay.vue'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
onMounted(() => setTimeout(() => (visible.value = true), 50))

// ─── State de démo (à remplacer par gameStore) ────────────────────────────────
const mode = ref<'x01' | '221' | 'cricket' | 'atc'>('x01')
const roundNumber = ref(1)

const teams = ref([
  { name: 'Équipe 1', color: 'var(--cs-green)', players: ['Alice', 'Bob'], score: 501 },
  { name: 'Équipe 2', color: 'var(--cs-red)', players: ['Carla'], score: 501 },
])

const activeTeamIdx = ref(0)
const activeTeam = computed(() => teams.value[activeTeamIdx.value])

const liveThrows = ref<DartThrow[]>([])
const liveTotal = computed(() => liveThrows.value.reduce((s, t) => s + t.value, 0))

const dartboardRef = ref<InstanceType<typeof DartboardOverlay> | null>(null)
const showMenu = ref(false)

function onDartThrown(dart: DartThrow) {
  liveThrows.value.push(dart)
}

function onRoundComplete(throws: DartThrow[]) {
  const total = throws.reduce((s, t) => s + t.value, 0)
  previousDarts.value = throws.map((t) => ({
    throw: t,
    teamIndex: activeTeamIdx.value,
    playerColor: activeTeam.value.color,
  }))
  teams.value[activeTeamIdx.value].score -= total
  liveThrows.value = []
  if (activeTeamIdx.value === teams.value.length - 1) roundNumber.value++
  activeTeamIdx.value = (activeTeamIdx.value + 1) % teams.value.length
}

function undoLast() {
  dartboardRef.value?.undoLastThrow()
  liveThrows.value.pop()
}

function validateManually() {
  dartboardRef.value?.forceCommit()
}

function quitGame() {
  showMenu.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="game" :class="{ visible }">
    <!-- ── Barre de statut ── -->
    <header class="game-bar">
      <div class="game-bar-left">
        <button class="btn-menu" @click="showMenu = true">☰</button>
        <span class="game-mode-tag">{{ mode.toUpperCase() }}</span>
      </div>
      <div class="game-round">
        <span class="round-label">Round</span>
        <span class="round-number">{{ roundNumber }}</span>
      </div>
      <div class="game-bar-right">
        <span class="turn-indicator" :style="{ color: activeTeam.color }">
          {{ activeTeam.name }}
        </span>
      </div>
    </header>

    <!-- ── Scores ── -->
    <div class="scoreboard">
      <div
        v-for="(team, i) in teams"
        :key="i"
        class="team-score"
        :class="{ active: i === activeTeamIdx }"
        :style="{ '--tc': team.color }"
      >
        <div class="team-score-inner">
          <div class="team-info">
            <span class="team-score-name">{{ team.name }}</span>
            <span class="team-score-players">{{ team.players.join(' · ') }}</span>
          </div>
          <div class="team-score-value">{{ team.score }}</div>
        </div>
        <div class="team-live" v-if="i === activeTeamIdx && liveTotal > 0">
          <span class="live-label">volée</span>
          <span class="live-value">−{{ liveTotal }}</span>
        </div>
      </div>
    </div>

    <!-- ── Cible ── -->
    <div class="board-area">
      <DartboardOverlay
        ref="dartboardRef"
        :active-team-color="activeTeam.color"
        :historic-darts="previousDarts"
        @dart-thrown="onDartThrown"
        @round-complete="onRoundComplete"
      />
    </div>

    <!-- ── Contrôles ── -->
    <div class="game-controls">
      <button class="ctrl-btn ctrl-undo" @click="undoLast">
        <span class="ctrl-icon">↩</span>
        <span class="ctrl-label">Annuler</span>
      </button>
      <div class="throws-counter">
        <div
          v-for="n in 3"
          :key="n"
          class="throw-dot"
          :class="{ filled: n <= liveThrows.length }"
          :style="n <= liveThrows.length ? { background: activeTeam.color } : {}"
        />
      </div>
      <button
        class="ctrl-btn ctrl-validate"
        :style="{ '--tc': activeTeam.color }"
        @click="validateManually"
      >
        <span class="ctrl-icon">✓</span>
        <span class="ctrl-label">Valider</span>
      </button>
    </div>

    <!-- ── Menu pause ── -->
    <Transition name="menu">
      <div class="menu-overlay" v-if="showMenu" @click.self="showMenu = false">
        <div class="menu-drawer">
          <div class="menu-header">
            <span class="menu-title">🎯 Partie en cours</span>
            <button class="btn-close" @click="showMenu = false">✕</button>
          </div>
          <div class="menu-body">
            <button class="menu-item" @click="showMenu = false">▶ Reprendre</button>
            <button class="menu-item menu-item--danger" @click="quitGame">🚪 Quitter</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.game.visible {
  opacity: 1;
}

/* ── Status bar ── */
.game-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--cs-muted) 15%, transparent);
  background: color-mix(in srgb, var(--cs-surface) 90%, transparent);
  backdrop-filter: blur(4px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.game-bar-left,
.game-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 90px;
}
.game-bar-right {
  justify-content: flex-end;
}

.btn-menu {
  background: transparent;
  border: none;
  color: var(--cs-subtle);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition:
    color var(--transition),
    background var(--transition);
}
.btn-menu:hover {
  color: var(--cs-text);
  background: var(--cs-overlay);
}

.game-mode-tag {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cs-muted);
  border: 1px solid color-mix(in srgb, var(--cs-muted) 25%, transparent);
  padding: 2px 7px;
  border-radius: 4px;
}

.game-round {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  text-align: right;
}

/* ── Scoreboard ── */
.scoreboard {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
}

.team-score {
  flex: 1;
  background: color-mix(in srgb, var(--tc) 6%, var(--cs-surface));
  border: 1px solid color-mix(in srgb, var(--tc) 15%, transparent);
  border-radius: var(--radius);
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}
.team-score.active {
  border-color: color-mix(in srgb, var(--tc) 50%, transparent);
  background: color-mix(in srgb, var(--tc) 12%, var(--cs-surface));
  box-shadow: 0 0 20px color-mix(in srgb, var(--tc) 14%, transparent);
}

.team-score-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}
.team-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.team-score-name {
  font-size: 11px;
  letter-spacing: 0.07em;
  color: var(--tc);
  text-transform: uppercase;
}
.team-score-players {
  font-size: 9px;
  color: var(--cs-muted);
  letter-spacing: 0.04em;
}
.team-score-value {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: var(--tc);
}

.team-live {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: color-mix(in srgb, var(--tc) 8%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--tc) 15%, transparent);
}
.live-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--cs-muted);
}
.live-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--cs-yellow);
}

/* ── Board ── */
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px 48px;
}

/* ── Contrôles ── */
.game-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 28px;
  gap: 16px;
}

.ctrl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  border-radius: var(--radius);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
  min-width: 80px;
}

.ctrl-undo {
  background: color-mix(in srgb, var(--cs-red) 8%, var(--cs-surface));
  color: var(--cs-red);
  border: 1px solid color-mix(in srgb, var(--cs-red) 25%, transparent);
}
.ctrl-undo:hover {
  background: color-mix(in srgb, var(--cs-red) 16%, var(--cs-surface));
  border-color: color-mix(in srgb, var(--cs-red) 50%, transparent);
}

.ctrl-validate {
  background: color-mix(in srgb, var(--tc) 10%, var(--cs-surface));
  color: var(--tc);
  border: 1px solid color-mix(in srgb, var(--tc) 28%, transparent);
}
.ctrl-validate:hover {
  background: color-mix(in srgb, var(--tc) 20%, var(--cs-surface));
  border-color: color-mix(in srgb, var(--tc) 55%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--tc) 15%, transparent);
}

.ctrl-icon {
  font-size: 20px;
}
.ctrl-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.throws-counter {
  display: flex;
  gap: 8px;
  align-items: center;
}
.throw-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cs-overlay);
  border: 1px solid color-mix(in srgb, var(--cs-muted) 30%, transparent);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.throw-dot.filled {
  box-shadow: 0 0 8px currentColor;
}

/* ── Menu pause ── */
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
  border-top: 1px solid color-mix(in srgb, var(--cs-muted) 25%, transparent);
  border-radius: 20px 20px 0 0;
  padding-bottom: 32px;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--cs-muted) 15%, transparent);
}
.menu-title {
  font-size: 15px;
  letter-spacing: 0.06em;
}
.btn-close {
  background: transparent;
  border: none;
  color: var(--cs-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.menu-body {
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.menu-item {
  text-align: left;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  background: var(--cs-overlay);
  color: var(--cs-text);
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: 0.04em;
}
.menu-item:hover {
  border-color: color-mix(in srgb, var(--cs-muted) 30%, transparent);
}
.menu-item--danger {
  color: var(--cs-red);
}
.menu-item--danger:hover {
  background: color-mix(in srgb, var(--cs-red) 10%, var(--cs-overlay));
  border-color: color-mix(in srgb, var(--cs-red) 30%, transparent);
}

/* ── Transitions ── */
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
