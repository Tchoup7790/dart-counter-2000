<template>
  <div class="setup" :class="state.visible ? 'visible' : ''">
    <!-- Navigation -->
    <nav class="setup-nav">
      <button class="btn-back" @click="goBack">← Retour</button>
      <span
        class="mode-badge"
        :style="{
          color: MODE_COLOR[state.mode],
          borderColor: MODE_COLOR[state.mode],
        }"
        >{{ MODE_LABEL[state.mode] }}</span
      >
    </nav>

    <div class="setup-content">
      <h2 class="setup-title">Configuration</h2>

      <!-- ÉQUIPES -->
      <section class="section">
        <h3 class="section-title">⚔️ Équipes</h3>
        <div class="teams-grid">
          <TeamBlock
            v-for="(team, ti) in state.teams"
            :key="ti"
            :team-name="TEAM_NAMES[ti]!"
            :color="TEAM_COLORS[ti]!"
            :players="team.players"
            :max-players="4"
            @add-player="addPlayer(ti)"
            @remove-player="(pi: number) => removePlayer(ti, pi)"
            @update-name="
              (pi: number, val: string) =>
                updateName(ti, pi, val)
            "
          />
        </div>
      </section>

      <!-- OPTIONS X01 -->
      <section
        class="section"
        v-if="state.mode === GameMode.X01"
      >
        <h3 class="section-title">⚙️ Options X01</h3>

        <ChipSelector
          v-model="state.x01Options.startingPoints"
          :options="[
            X01_VARIANTS.X301,
            X01_VARIANTS.X501,
            X01_VARIANTS.X701,
            X01_VARIANTS.X1001,
          ]"
          label="Points de départ"
        />

        <div class="toggle-list">
          <OptionToggle
            v-model="state.x01Options.doubleIn"
            label="Double In"
            description="Commencer sur un double"
          />
          <OptionToggle
            v-model="state.x01Options.doubleOut"
            label="Double Out"
            description="Finir sur un double"
          />
          <OptionToggle
            v-model="state.x01Options.masterIn"
            label="Master In"
            description="Double ou triple pour commencer"
          />
          <OptionToggle
            v-model="state.x01Options.masterOut"
            label="Master Out"
            description="Double ou triple pour finir"
          />
        </div>
      </section>

      <!-- OPTIONS 221 -->
      <section
        class="section"
        v-if="state.mode === GameMode.TWO_HUNDRED_TWENTY_ONE"
      >
        <h3 class="section-title">⚙️ Options 221</h3>
        <div class="toggle-list">
          <OptionToggle
            v-model="state.twoHundredTwentyTwoOptions.doubleOut"
            label="Double Out"
            description="Finir exactement sur un double"
          />
        </div>
      </section>

      <!-- OPTIONS CRICKET -->
      <section
        class="section"
        v-if="state.mode === GameMode.CRICKET"
      >
        <h3 class="section-title">⚙️ Options Cricket</h3>
        <div class="toggle-list">
          <OptionToggle
            v-model="state.cricketOptions.crazy"
            label="Crazy Cricket"
            description="Secteurs tirés aléatoirement"
          />
          <OptionToggle
            v-model="state.cricketOptions.cutThroat"
            label="Cut-Throat"
            description="Les points vont aux adversaires"
          />
        </div>
      </section>

      <!-- OPTIONS AROUND THE CLOCK -->
      <section
        class="section"
        v-if="state.mode === GameMode.ATC"
      >
        <h3 class="section-title">
          ⚙️ Options Around the Clock
        </h3>
        <div class="toggle-list">
          <OptionToggle
            v-model="state.atcOptions.mustDouble"
            label="Must Double"
            description="Finir sur un double bull"
          />
        </div>
      </section>
    </div>

    <!-- CTA -->
    <div class="setup-cta">
      <button
        class="btn-start"
        :class="{ 'btn-start--ready': canStart }"
        :disabled="!canStart"
        @click="startGame"
      >
        🎯 Lancer la partie
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { GameMode } from '@/models/enums/game-mode.enum'
import type { X01Options } from '@/models/interfaces/x01.interface'
import type { Player } from '@/models/interfaces/player.interface'
import type { Team } from '@/models/interfaces/team.interface'
import { useGameStore } from '@/stores/game.store'
import type { CricketOptions } from '@/models/interfaces/cricket.interface'
import type { AtcOptions } from '@/models/interfaces/arround-the-clock.interface'
import { X01_VARIANTS } from '@/models/enums/x01-variants.enum'
import ChipSelector from '@/components/chip-selector.vue'
import OptionToggle from '@/components/option-toggle.vue'
import TeamBlock from '@/components/team-block.vue'
import type { TwoHundredTwentyOneOptions } from '@/models/interfaces/two-hundred-twenty-one.interface'

// Router & route
const router = useRouter()
const route = useRoute()
const game = useGameStore()

interface SetupViewState {
  visible: boolean
  mode: GameMode

  teams: Team[]

  x01Options: X01Options
  cricketOptions: CricketOptions
  twoHundredTwentyTwoOptions: TwoHundredTwentyOneOptions
  atcOptions: AtcOptions
}

// Couleurs joueurs
const PLAYER_COLORS = [
  'var(--cs-green)',
  'var(--cs-red)',
  'var(--cs-yellow)',
  'var(--cs-cyan)',
  'var(--cs-violet)',
  'var(--cs-rose)',
]

// Teams Setup
const TEAM_COLORS = ['var(--cs-green)', 'var(--cs-red)']
const TEAM_NAMES = ['Équipe 1', 'Équipe 2']

// Mode
const MODE_LABEL: Record<GameMode, string> = {
  X01: 'X01',
  '221': '221',
  cricket: 'Cricket',
  'around-the-clock': 'Around the Clock',
}
const MODE_COLOR: Record<GameMode, string> = {
  X01: 'var(--cs-green)',
  '221': 'var(--cs-yellow)',
  cricket: 'var(--cs-red)',
  'around-the-clock': 'var(--cs-cyan)',
}

const state: SetupViewState = reactive({
  visible: false,
  mode: route.params.mode as GameMode,

  // Teams Maker
  teams: [
    {
      name: TEAM_NAMES[0]!,
      points: 0,
      players: [makePlayer(0, 0)],
    },
    {
      name: TEAM_NAMES[1]!,
      points: 0,
      players: [makePlayer(1, 0)],
    },
  ],

  // Options
  x01Options: {
    startingPoints: X01_VARIANTS.X501,
    doubleIn: false,
    doubleOut: true,
    masterIn: false,
    masterOut: false,
  },
  cricketOptions: {
    crazy: false,
    cutThroat: false,
  },
  twoHundredTwentyTwoOptions: {
    doubleOut: false,
  },
  atcOptions: {
    mustDouble: false,
  },
})

// Animation d'entrée
onMounted(() => setTimeout(() => (state.visible = true), 50))

// Équipes
function makePlayer(teamIdx: number, playerIdx: number): Player {
  return {
    id: `${teamIdx}-${playerIdx}-${Date.now()}`,
    name: `Joueur ${playerIdx + 1}`,
    points: 0,
    color:
      PLAYER_COLORS[
        (teamIdx * 3 + playerIdx) % PLAYER_COLORS.length
      ]!,
  }
}

function addPlayer(teamIndex: number) {
  const team = state.teams[teamIndex]
  if (!team || team.players.length >= 4) return
  team.players.push(makePlayer(teamIndex, team.players.length))
}

function removePlayer(teamIndex: number, playerIndex: number) {
  const team = state.teams[teamIndex]
  if (!team || team.players.length <= 1) return
  team.players.splice(playerIndex, 1)
}

function updateName(
  teamIndex: number,
  playerIndex: number,
  value: string,
) {
  const player = state.teams[teamIndex]?.players[playerIndex]
  if (player) player.name = value
}

// Options actives selon le mode
const activeOptions = computed(() => {
  switch (state.mode) {
    case GameMode.TWO_HUNDRED_TWENTY_ONE:
      return state.twoHundredTwentyTwoOptions
    case GameMode.CRICKET:
      return state.cricketOptions
    case GameMode.ATC:
      return state.atcOptions
    default:
      return state.x01Options
  }
})

// Validation & lancement
const canStart = computed(() =>
  state.teams.every(
    (team) =>
      team.players.length > 0 &&
      team.players.every((p) => p.name.trim().length > 0),
  ),
)

function startGame() {
  if (!canStart.value) return

  game.initGame({
    mode: state.mode,
    options: activeOptions.value,
    teams: state.teams,
  })

  router.push({ name: 'game' })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.setup {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.setup.visible {
  opacity: 1;
}

/* Nav */
.setup-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
}

.btn-back {
  font-size: 13px;
  color: var(--cs-subtle);
  background: transparent;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition:
    color var(--transition),
    background var(--transition);
}
.btn-back:hover {
  color: var(--cs-text);
  background: var(--cs-overlay);
}

.mode-badge {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: 20px;
}

/* Contenu */
.setup-content {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.setup-title {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.08em;
  color: var(--cs-text);
}

/* Section */
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.4s ease both;
}

.section-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cs-muted);
}

/* Teams */
.teams-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Toggles */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* CTA */
.setup-cta {
  padding: 16px 20px 32px;
}

.btn-start {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: var(--radius);
  cursor: not-allowed;
  background: color-mix(
    in srgb,
    var(--cs-green) 6%,
    var(--cs-surface)
  );
  color: var(--cs-muted);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
  transition: all 0.35s ease;
}

.btn-start--ready {
  background: color-mix(
    in srgb,
    var(--cs-green) 18%,
    var(--cs-surface)
  );
  color: var(--cs-green);
  border-color: color-mix(
    in srgb,
    var(--cs-green) 45%,
    transparent
  );
  cursor: pointer;
  box-shadow: 0 0 24px
    color-mix(in srgb, var(--cs-green) 15%, transparent);
}
.btn-start--ready:hover {
  background: color-mix(
    in srgb,
    var(--cs-green) 28%,
    var(--cs-surface)
  );
  box-shadow: 0 0 36px
    color-mix(in srgb, var(--cs-green) 25%, transparent);
}
.btn-start--ready:active {
  transform: scale(0.98);
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
