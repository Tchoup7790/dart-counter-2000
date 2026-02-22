<template>
  <main class="intro-view">
    <div>
      <!-- Page title -->
      <h1>Dart Counter 2000</h1>

      <p>Entrez les joueurs</p>
    </div>

    <div>
      <input type="text" />
      <input type="text" class="error" />
    </div>

    <!-- Button that starts the routine -->
    <button @click="startRoutine">Commencer la séance</button>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStagger } from '@/composables/use-stagger'

// Router instance used for navigation
const router = useRouter()

// Navigate to the routine page when the button is clicked
function startRoutine() {
  router.push('/routine')
}

// Animate titles and button with a staggered entrance
onMounted(() => {
  useStagger('.intro-view > div > *, .intro-view > button')
})
</script>

<style lang="css" scoped>
main {
  height: 100%;
  justify-content: space-around;
}
</style>
