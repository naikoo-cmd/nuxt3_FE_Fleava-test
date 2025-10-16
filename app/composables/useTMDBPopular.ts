import { computed } from 'vue'

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

export function useTMDBPopular() {
  const config = useRuntimeConfig()
  const img = (path: string | null, size: string) =>
    path ? `${config.public.tmdbImageBase}/${size}${path}` : ''

  const { data, pending, error, refresh } = useFetch<{ results: TMDBMovie[] }>('/api/tmdb/popular', {
    key: 'tmdb-popular',
    default: () => ({ results: [] }),
    server: true
  })

  const all = computed(() =>
    (data.value?.results || []).map(m => ({
      id: m.id,
      title: m.title || m.name || 'Untitled',
      overview: m.overview,
      poster: img(m.poster_path, 'w500'),
      backdrop: img(m.backdrop_path, 'w1280'),
      year: (m.release_date || m.first_air_date || '').slice(0, 4),
      rating: m.vote_average
    }))
  )

  const slides = computed(() =>
    all.value.slice(0, 5).map(s => ({
      id: s.id,
      title: s.title,
      overview: s.overview,
      image: s.backdrop || s.poster // fallback if no backdrop
    }))
  )

  const grid = computed(() => all.value.slice(5))

  return { slides, grid, pending, error, refresh }
}