<template>
  <header class="site-header">
    <div class="site-header__inner">
      <div class="site-header__brand">
        <span class="logo-dot" /> Naiko Movies
      </div>

      <nav class="site-header__nav" aria-label="Primary">
        <a href="#" class="site-header__link">Home</a>
        <a href="#" class="site-header__link">Movies</a>
        <a href="#" class="site-header__link">Series</a>
        <a href="#" class="site-header__link">My List</a>
      </nav>

      <!-- Toggle only (search bar removed) -->
      <div class="justify-self-end flex items-center">
        <button
          class="site-header__toggle"
          @click="toggleTheme"
          :aria-pressed="isDark ? 'true' : 'false'"
          :title="isDark ? 'Switch to light' : 'Switch to dark'"
        >
          <span v-if="isDark">☾ Dark</span>
          <span v-else>☀ Light</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isDark = ref(true)
const STORAGE_KEY = 'theme'

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) { root.classList.add('dark'); root.classList.remove('light') }
  else { root.classList.remove('dark'); root.classList.add('light') }
}
function toggleTheme() {
  const root = document.documentElement
  root.classList.add('theme-transition')
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  setTimeout(() => root.classList.remove('theme-transition'), 420)
}
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light') isDark.value = false
  applyTheme(isDark.value)
  document.documentElement.classList.remove('theme-transition')
})
</script>

<style lang="scss" src="@/layout/styles/Header.scss"></style>