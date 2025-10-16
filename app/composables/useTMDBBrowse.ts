import { computed, ref, watch } from 'vue'

type Category = 'popular' | 'top_rated' | 'upcoming'
type TMDBMovie = {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}

export function useTMDBBrowse() {
  const category = ref<Category>('popular')
  const config = useRuntimeConfig()
  const img = (path: string | null, size: string) =>
    path ? `${config.public.tmdbImageBase}/${size}${path}` : ''

  const popular = useFetch<{ results: TMDBMovie[] }>('/api/tmdb/popular', {
    key: 'tmdb-popular',
    default: () => ({ results: [] }),
    server: true
  })
  const topRated = useFetch<{ results: TMDBMovie[] }>('/api/tmdb/top_rated', {
    key: 'tmdb-top_rated',
    default: () => ({ results: [] }),
    server: false,
    lazy: true
  })
  const upcoming = useFetch<{ results: TMDBMovie[] }>('/api/tmdb/upcoming', {
    key: 'tmdb-upcoming',
    default: () => ({ results: [] }),
    server: false,
    lazy: true
  })

  const mapMovie = (m: TMDBMovie) => ({
    id: m.id,
    title: m.title || m.name || 'Untitled',
    overview: m.overview,
    poster: img(m.poster_path, 'w500'),
    backdrop: img(m.backdrop_path, 'w1280'),
    year: (m.release_date || m.first_air_date || '').slice(0, 4),
    rating: m.vote_average
  })

  const lists = {
    popular: computed(() => (popular.data.value?.results || []).map(mapMovie)),
    top_rated: computed(() => (topRated.data.value?.results || []).map(mapMovie)),
    upcoming: computed(() => (upcoming.data.value?.results || []).map(mapMovie))
  }

  const pendingBy = {
    popular: popular.pending,
    top_rated: topRated.pending,
    upcoming: upcoming.pending
  }

  // Fetch on demand when switching
  watch(category, (c) => {
    if (c === 'top_rated' && !topRated.data.value?.results?.length) topRated.refresh()
    if (c === 'upcoming' && !upcoming.data.value?.results?.length) upcoming.refresh()
  }, { immediate: true })

  const movies = computed(() => lists[category.value].value)
  const slides = computed(() =>
    movies.value.slice(0, 5).map(s => ({
      id: s.id,
      title: s.title,
      overview: s.overview,
      image: s.backdrop || s.poster
    }))
  )
  const grid = computed(() => movies.value.slice(5))
  const pending = computed(() => pendingBy[category.value].value)

  function setCategory(c: Category) { category.value = c }

  return { category, setCategory, slides, grid, pending, lists }
}