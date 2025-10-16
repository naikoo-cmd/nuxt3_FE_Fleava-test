<template>
  <div class="movies">
    <MovieCard v-for="(m, idx) in movies" :key="m?.id !== undefined ? `${m.id}-${idx}` : `row-${idx}`" :movie="m" />

    <!-- Fillers to complete a 6-column row on desktop -->
    <div
      v-for="i in fillerCount"
      :key="'ghost-'+i"
      class="movie movie--ghost"
      aria-hidden="true"
    />

    <!-- Loading skeleton row -->
    <SkeletonCard v-if="loading" v-for="i in 6" :key="'sk'+i" />

    <!-- Infinite scroll sentinel (client-only to avoid SSR directive processing) -->
    <ClientOnly>
      <div v-intersect="onIntersect" class="infinite-sentinel" aria-hidden="true"></div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MovieCard from './MovieCard.vue'
import SkeletonCard from './SkeletonCard.vue'

const props = withDefaults(defineProps<{
  movies: any[]
  loading?: boolean
  onIntersect?: () => void
}>(), {
  loading: false
})

const fillerCount = computed(() => {
  const perRow = 6
  const mod = props.movies.length % perRow
  return mod === 0 ? 0 : perRow - mod
})

function onIntersect() {
  if (typeof props.onIntersect === 'function') props.onIntersect()
}
</script>

<style lang="scss" src="@/layout/styles/PopularMovies.scss"></style>
<style scoped>
</style>