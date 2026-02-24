<template>
  <div class="setup" :class="state.visible ? 'visible' : ''">
    <nav class="setup-nav">
      <button class="btn-back" @click="goBack">← Retour</button>
      <span
        class="mode-badge"
        :style="{ color: accentColor, borderColor: accentColor }"
      >
        {{ MODE_LABEL[mode] }}
      </span>
    </nav>

    <div class="setup-content">
      <h2 class="setup-title">Configuration</h2>

      <!-- Toggle équipe / solo -->
      <section class="section">
        <OptionToggle
          :model-value="state.teamMode"
          label="Mode équipe"
          description="Regrouper les joueurs en équipes"
          @update:model-value="state.teamMode = $event"
        />
      </section>

      <!-- MODE SOLO -->
      <section class="section" v-if="!state.teamMode">
        <div class="section-header">
          <h3 class="section-title">🎯 Joueurs</h3>
          <button
            class="btn-add-entity"
            :disabled="state.soloPlayers.length >= 12"
            @click="addSoloPlayer"
          >
            + Joueur
          </button>
        </div>

        <TransitionGroup name="row" tag="div" class="solo-list">
          <div
            v-for="(player, pi) in state.soloPlayers"
            :key="player.id"
            class="solo-row"
            :style="{ '--tc': player.color }"
          >
            <span class="solo-dot" />
            <input
              class="field"
              :value="player.name"
              :placeholder="`Joueur ${pi + 1}`"
              maxlength="20"
              @input="
                player.name = (
                  $event.target as HTMLInputElement
                ).value
              "
            />
            <button
              class="btn-remove"
              :disabled="state.soloPlayers.length <= 1"
              @click="removeSoloPlayer(pi)"
            >
              ✕
            </button>
          </div>
        </TransitionGroup>

        <p class="counter">
          {{ state.soloPlayers.length }}/12 joueurs
        </p>
      </section>

      <!-- MODE ÉQUIPE -->
      <section class="section" v-else>
        <div class="section-header">
          <h3 class="section-title">⚔️ Équipes</h3>
          <button class="btn-add-entity" @click="addTeam">
            + Équipe
          </button>
        </div>

        <TransitionGroup name="row" tag="div" class="teams-list">
          <div
            v-for="(team, ti) in state.teams"
            :key="team.id"
            class="team-block"
            :style="{ '--tc': team.color }"
          >
            <!-- En-tête -->
            <div class="team-header">
              <span class="color-dot" />
              <input
                class="field field--team"
                :value="team.name"
                maxlength="20"
                @input="
                  team.name = (
                    $event.target as HTMLInputElement
                  ).value
                "
              />
              <button
                class="btn-add-player"
                :disabled="
                  state.teams.reduce(
                    (s, t) => s + t.players.length,
                    0,
                  ) >= 12
                "
                @click="addPlayerToTeam(ti)"
              >
                + Joueur
              </button>
              <button
                class="btn-remove"
                :disabled="state.teams.length <= 1"
                @click="removeTeam(ti)"
              >
                ✕
              </button>
            </div>

            <!-- Joueurs -->
            <TransitionGroup
              name="row"
              tag="div"
              class="player-list"
            >
              <div
                v-for="(player, pi) in team.players"
                :key="player.id"
                class="player-row"
              >
                <span class="player-idx">{{ pi + 1 }}</span>
                <input
                  class="field"
                  :value="player.name"
                  :placeholder="`Joueur ${pi + 1}`"
                  maxlength="20"
                  @input="
                    player.name = (
                      $event.target as HTMLInputElement
                    ).value
                  "
                />
                <button
                  class="btn-remove btn-remove--sm"
                  :disabled="team.players.length <= 1"
                  @click="removePlayerFromTeam(ti, pi)"
                >
                  ✕
                </button>
              </div>
            </TransitionGroup>
          </div>
        </TransitionGroup>

        <p class="counter">
          {{
            state.teams.reduce(
              (s, t) => s + t.players.length,
              0,
            )
          }}/12 joueurs au total
        </p>
      </section>

      <!-- OPTIONS X01 -->
      <section class="section" v-if="mode === GameMode.X01">
        <h3 class="section-title">⚙️ Options X01</h3>
        <ChipSelector
          :model-value="state.x01Options.startingPoints"
          :options="X01_ALL_VARIANTS"
          label="Points de départ"
          @update:model-value="
            state.x01Options.startingPoints = $event as number
          "
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
        v-if="mode === GameMode.TWO_HUNDRED_TWENTY_ONE"
      >
        <h3 class="section-title">⚙️ Options 221</h3>
        <div class="toggle-list">
          <OptionToggle
            v-model="state.twoHundredTwentyOneOptions.doubleOut"
            label="Double Out"
            description="Finir sur un double"
          />
        </div>
      </section>

      <!-- OPTIONS CRICKET -->
      <section class="section" v-if="mode === GameMode.CRICKET">
        <h3 class="section-title">⚙️ Options Cricket</h3>
        <div class="toggle-list">
          <OptionToggle
            v-model="state.cricketOptions.crazy"
            label="Crazy Cricket"
            description="Secteurs aléatoires"
          />
          <OptionToggle
            v-model="state.cricketOptions.cutThroat"
            label="Cut-Throat"
            description="Les points vont aux adversaires"
          />
        </div>
      </section>

      <!-- OPTIONS ATC -->
      <section class="section" v-if="mode === GameMode.ATC">
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
        :style="canStart ? { '--ac': accentColor } : {}"
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
import { useGameStore } from '@/stores/game.store'
import { useX01Store } from '@/stores/x01.store'
import { use221Store } from '@/stores/two-hundred-twenty-one.store'
import { useCricketStore } from '@/stores/cricket.store'
import { useAtcStore } from '@/stores/atc.store'
import { GameMode } from '@/models/enums/game-mode.enum'
import type {
  Team,
  Player,
  SoloPlayer,
} from '@/models/interfaces/player.interface'
import type { X01Options } from '@/models/interfaces/x01.interface'
import type { TwoHundredTwentyOneOptions } from '@/models/interfaces/two-hundred-twenty-one.interface'
import type { CricketOptions } from '@/models/interfaces/cricket.interface'
import type { AtcOptions } from '@/models/interfaces/arround-the-clock.interface'
import {
  MODE_COLOR,
  MODE_LABEL,
  PLAYER_COLORS,
  TEAM_COLORS,
  X01_ALL_VARIANTS,
} from '@/utils/constantes'
import { X01_VARIANTS } from '@/models/enums/x01-variants.enum'
import { useRoute, useRouter } from 'vue-router'
import OptionToggle from '@/components/option-toggle.vue'
import ChipSelector from '@/components/chip-selector.vue'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const x01Store = useX01Store()
const s221Store = use221Store()
const cricketStore = useCricketStore()
const atcStore = useAtcStore()

interface SetupViewState {
  visible: boolean
  teamMode: boolean
  soloPlayers: SoloPlayer[]
  teams: Team[]
  x01Options: X01Options
  twoHundredTwentyOneOptions: TwoHundredTwentyOneOptions
  cricketOptions: CricketOptions
  atcOptions: AtcOptions
}

// Options
const state: SetupViewState = reactive({
  visible: false,
  teamMode: false,
  soloPlayers: [
    { id: getId(), name: 'Joueur 1', color: PLAYER_COLORS[0]! },
    { id: getId(), name: 'Joueur 2', color: PLAYER_COLORS[1]! },
  ],
  teams: [
    {
      id: getId(),
      name: 'Équipe 1',
      color: TEAM_COLORS[0]!,
      points: 0,
      players: [{ id: getId(), name: 'Joueur 1' }],
    },
    {
      id: getId(),
      name: 'Équipe 2',
      color: TEAM_COLORS[1]!,
      points: 0,
      players: [{ id: getId(), name: 'Joueur 1' }],
    },
  ],
  x01Options: {
    startingPoints: X01_VARIANTS.X501,
    doubleIn: false,
    doubleOut: true,
    masterIn: false,
    masterOut: false,
  },
  twoHundredTwentyOneOptions: {
    doubleOut: false,
  },
  cricketOptions: {
    crazy: false,
    cutThroat: true,
  },
  atcOptions: { mustDouble: false },
})

onMounted(() => setTimeout(() => (state.visible = true), 50))

// Mode
const mode = route.params.mode as GameMode

const accentColor = computed(() => MODE_COLOR[mode])

function getId() {
  return Math.random().toString(36).slice(2)
}

// Mode SOLO
function addSoloPlayer() {
  if (state.soloPlayers.length >= 12) return
  const idx = state.soloPlayers.length
  state.soloPlayers.push({
    id: getId(),
    name: `Joueur ${idx + 1}`,
    color: PLAYER_COLORS[idx % PLAYER_COLORS.length]!,
  })
}

function removeSoloPlayer(idx: number) {
  if (state.soloPlayers.length <= 1) return
  state.soloPlayers.splice(idx, 1)
}

// Mode ÉQUIPE
function addTeam() {
  const idx = state.teams.length
  state.teams.push({
    id: getId(),
    name: `Équipe ${idx + 1}`,
    color: TEAM_COLORS[idx % TEAM_COLORS.length]!,
    points: 0,
    players: [{ id: getId(), name: 'Joueur 1' }],
  })
}

function removeTeam(ti: number) {
  if (state.teams.length <= 1) return
  state.teams.splice(ti, 1)
}

function addPlayerToTeam(ti: number) {
  if (
    state.teams.reduce((s, t) => s + t.players.length, 0) >= 12
  )
    return
  const team = state.teams[ti]!
  team.players.push({
    id: getId(),
    name: `Joueur ${team.players.length + 1}`,
  })
}

function removePlayerFromTeam(ti: number, pi: number) {
  const team = state.teams[ti]!
  if (team.players.length <= 1) return
  team.players.splice(pi, 1)
}

// Validation
const canStart = computed(() => {
  if (!state.teamMode) {
    return (
      state.soloPlayers.length >= 1 &&
      state.soloPlayers.every((p) => p.name.trim().length > 0)
    )
  }
  return (
    state.teams.length >= 1 &&
    state.teams.every(
      (t) =>
        t.name.trim().length > 0 &&
        t.players.length >= 1 &&
        t.players.every((p) => p.name.trim().length > 0),
    )
  )
})

// Lancement
function startGame() {
  if (!canStart.value) return

  let builtTeams: Team[]

  if (!state.teamMode) {
    // Chaque joueur = une Team, couleur sur le joueur
    builtTeams = state.soloPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      points: 0,
      players: [
        {
          id: p.id,
          name: p.name,
        } as Player,
      ],
    }))
  } else {
    // Équipes, couleur sur l'équipe, joueurs sans couleur
    builtTeams = state.teams.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      points: 0,
      players: t.players.map(
        (p) =>
          ({
            id: p.id,
            name: p.name,
          }) as Player,
      ),
    }))
  }

  let activeOptions:
    | X01Options
    | TwoHundredTwentyOneOptions
    | CricketOptions
    | AtcOptions

  switch (mode) {
    case GameMode.X01:
      activeOptions = state.x01Options
      break
    case GameMode.TWO_HUNDRED_TWENTY_ONE:
      activeOptions = state.twoHundredTwentyOneOptions
      break
    case GameMode.CRICKET:
      activeOptions = state.cricketOptions
      break
    case GameMode.ATC:
      activeOptions = state.atcOptions
      break
  }

  game.initGame({
    mode,
    options: activeOptions,
    teams: builtTeams,
  })

  switch (mode) {
    case GameMode.X01:
      x01Store.init(
        state.x01Options,
        builtTeams.length,
        builtTeams.map((t) => t.players.length),
      )
      builtTeams.forEach((_, ti) =>
        game.restorePoints(ti, state.x01Options.startingPoints),
      )
      break
    case GameMode.TWO_HUNDRED_TWENTY_ONE:
      activeOptions = state.twoHundredTwentyOneOptions
      s221Store.init(
        state.twoHundredTwentyOneOptions,
        builtTeams.length,
      )
      break
    case GameMode.CRICKET:
      activeOptions = state.cricketOptions
      cricketStore.init(state.cricketOptions, builtTeams.length)
      break
    case GameMode.ATC:
      activeOptions = state.atcOptions
      atcStore.init(state.atcOptions)
      builtTeams.forEach((_, ti) => game.restorePoints(ti, 1))
      break
  }

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

.setup-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
  position: sticky;
  top: 0;
  background: var(--cs-base);
  z-index: 10;
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

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.3s ease both;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cs-muted);
}

.btn-add-entity {
  font-size: 11px;
  padding: 5px 12px;
  font-family: inherit;
  background: color-mix(
    in srgb,
    var(--cs-green) 12%,
    transparent
  );
  color: var(--cs-green);
  border: 1px solid
    color-mix(in srgb, var(--cs-green) 30%, transparent);
  border-radius: 6px;
  cursor: pointer;
  transition: background var(--transition);
}
.btn-add-entity:hover {
  background: color-mix(
    in srgb,
    var(--cs-green) 22%,
    transparent
  );
}
.btn-add-entity:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.counter {
  margin: 0;
  font-size: 10px;
  color: var(--cs-muted);
  text-align: right;
  letter-spacing: 0.06em;
}

.btn-remove {
  background: transparent;
  border: none;
  color: var(--cs-muted);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
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
.btn-remove--sm {
  font-size: 10px;
}

/* Solo */
.solo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}
.solo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: color-mix(
    in srgb,
    var(--tc) 6%,
    var(--cs-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--tc) 18%, transparent);
  border-radius: var(--radius);
}
.solo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tc);
  flex-shrink: 0;
}

/* Équipes */
.teams-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
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
.team-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--tc) 8%, transparent);
  border-bottom: 1px solid
    color-mix(in srgb, var(--tc) 14%, transparent);
}
.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tc);
  flex-shrink: 0;
}
.btn-add-player {
  font-size: 10px;
  padding: 3px 8px;
  font-family: inherit;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--tc) 12%, transparent);
  color: var(--tc);
  border: 1px solid
    color-mix(in srgb, var(--tc) 25%, transparent);
  border-radius: 5px;
  cursor: pointer;
  transition: background var(--transition);
}
.btn-add-player:hover {
  background: color-mix(in srgb, var(--tc) 22%, transparent);
}
.btn-add-player:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.player-list {
  display: flex;
  flex-direction: column;
  position: relative;
}
.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--cs-muted) 10%, transparent);
}
.player-row:last-child {
  border-bottom: none;
}
.player-idx {
  font-size: 10px;
  color: var(--cs-muted);
  min-width: 14px;
  text-align: center;
}

/* Champ générique */
.field {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  padding: 2px 4px;
  font-size: 13px;
  font-family: inherit;
  color: var(--cs-text);
  outline: none;
  transition: border-color var(--transition);
}
.field:focus {
  border-bottom-color: var(--tc, var(--cs-green));
}
.field::placeholder {
  color: var(--cs-muted);
}
.field--team {
  font-weight: 700;
  color: var(--tc);
  letter-spacing: 0.05em;
}

/* Toggles */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* CTA */
.setup-cta {
  padding: 16px 20px 36px;
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
  transition: all 0.35s ease;
  background: color-mix(
    in srgb,
    var(--cs-muted) 6%,
    var(--cs-surface)
  );
  color: var(--cs-muted);
  border: 1px solid
    color-mix(in srgb, var(--cs-muted) 20%, transparent);
}
.btn-start--ready {
  background: color-mix(
    in srgb,
    var(--ac) 18%,
    var(--cs-surface)
  );
  color: var(--ac);
  border-color: color-mix(in srgb, var(--ac) 45%, transparent);
  cursor: pointer;
  box-shadow: 0 0 24px
    color-mix(in srgb, var(--ac) 15%, transparent);
}
.btn-start--ready:hover {
  background: color-mix(
    in srgb,
    var(--ac) 28%,
    var(--cs-surface)
  );
}
.btn-start--ready:active {
  transform: scale(0.98);
}

/* Transitions */
.row-enter-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.row-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
  position: absolute;
  width: 100%;
}
.row-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.row-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

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
