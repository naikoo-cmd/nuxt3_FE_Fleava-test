import { ref, computed } from 'vue'

type Category = 'popular' | 'top_rated' | 'upcoming'
export type CategoryValue = Category

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

type TMDBResponse = {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

type CatState = {
  nextApiPage: number
  totalResults: number
  totalApiPages: number
  items: TMDBMovie[]
  visible: number
  loading: boolean
  error: string | null
  finished: boolean
  pagesCache: Record<number, TMDBMovie[]>
}

const endpoints: Record<Category, string> = {
  popular: '/api/tmdb/popular',
  top_rated: '/api/tmdb/top_rated',
  upcoming: '/api/tmdb/upcoming'
}

export function useTMDBInfinite() {
  const config = useRuntimeConfig()
  const img = (path: string | null, size: string) =>
    path ? `${config.public.tmdbImageBase}/${size}${path}` : ''

  const makeState = (): CatState => ({
    nextApiPage: 1,
    totalResults: 0,
    totalApiPages: 0,
    items: [],
    visible: 0,
    loading: false,
    error: null,
    finished: false,
    pagesCache: {}
  })

  const states: Record<Category, CatState> = {
    popular: makeState(),
    top_rated: makeState(),
    upcoming: makeState()
  }

  const category = ref<Category>('popular')

  // Global fatal stop if API key is missing/invalid
  const fatalStop = ref(false)
  const fatalMessage = ref<string | null>(null)
  function stopAll(msg: string) {
    fatalStop.value = true
    fatalMessage.value = msg
    console.warn('[tmdb] Stopping all fetches:', msg)
    Object.values(states).forEach((st) => {
      st.error = msg
      st.finished = true
      st.loading = false
    })
  }

  async function fetchApiPage(cat: Category, page: number) {
    const st = states[cat]
    if (fatalStop.value) {
      st.error = fatalMessage.value || 'Fetching disabled'
      st.finished = true
      return []
    }
    if (st.pagesCache[page]) return st.pagesCache[page]

    try {
      st.loading = true
      st.error = null
      const res = await $fetch<TMDBResponse>(endpoints[cat], { query: { page } })
      st.totalResults = res.total_results
      st.totalApiPages = res.total_pages
      st.pagesCache[page] = res.results
      st.items.push(...res.results)
      if (page >= res.total_pages) st.finished = true
      return res.results
    } catch (e: any) {
      const code = e?.statusCode || e?.response?.status
      const errCode = e?.data?.code
      const apiMsg = e?.data?.message || e?.statusMessage || e?.message
      const keyMissing = errCode === 'TMDB_API_KEY_MISSING' || /tmdb api key missing/i.test(String(apiMsg))

      if (keyMissing) {
        stopAll('TMDB API key is missing or invalid.')
      } else {
        st.error = 'Failed to load movies. Please try again.'
        // Stop further attempts for this category on any HTTP error
        st.finished = true
      }

      console.error('[tmdb] fetch failed', { cat, page, code, errCode, apiMsg })
      return []
    } finally {
      st.loading = false
    }
  }

  // Ensure we have at least "n" items available
  async function ensure(cat: Category, n: number) {
    const st = states[cat]
    while (st.items.length < n && !st.finished && !fatalStop.value) {
      const before = st.items.length
      await fetchApiPage(cat, st.nextApiPage)
      const after = st.items.length
      if (after > before) {
        st.nextApiPage++
      } else {
        // No progress (error or terminal condition) → stop loop
        break
      }
    }
  }

  // Initial hydrate: fetch 12 so slideshow has 5 and grid starts filled
  async function init(cat: Category) {
    if (fatalStop.value) return
    const st = states[cat]
    if (st.visible === 0 && st.items.length === 0) {
      await ensure(cat, 12)
      st.visible = Math.min(12, st.items.length)
    }
  }

  function uiMap(m: TMDBMovie) {
    const posterSm = img(m.poster_path, 'w342')
    const posterMd = img(m.poster_path, 'w500')
    const posterLg = img(m.poster_path, 'w780')
    const backdrop = img(m.backdrop_path, 'w1280')
    return {
      id: m.id,
      title: m.title || m.name || 'Untitled',
      overview: m.overview,
      poster: posterMd,
      posterSet: posterSm && posterMd && posterLg ? `${posterSm} 342w, ${posterMd} 500w, ${posterLg} 780w` : undefined,
      backdrop,
      year: (m.release_date || m.first_air_date || '').slice(0, 4),
      rating: m.vote_average
    }
  }

  // Exposed computed for the active category
  const current = computed(() => states[category.value])
  const movies = computed(() => current.value.items.slice(0, current.value.visible).map(uiMap))
  const loadedCount = computed(() => current.value.visible)
  const total = computed(() => current.value.totalResults)
  const loading = computed(() => current.value.loading)
  const error = computed(() => fatalMessage.value || current.value.error)
  const finished = computed(() => {
    const st = current.value
    return (fatalStop.value || st.finished) && st.visible >= st.items.length
  })

  // Batch loading: exactly 6 more items
  async function loadMore6() {
    if (fatalStop.value) return
    const st = current.value
    const target = st.visible + 6
    await ensure(category.value, target)
    st.visible = Math.min(target, st.items.length)
  }

  // Manual pagination by logical "6-per-page"
  async function goToPage(n: number) {
    if (fatalStop.value) return
    if (n < 1) n = 1
    const targetVisible = n * 6
    await ensure(category.value, targetVisible)
    current.value.visible = Math.min(targetVisible, current.value.items.length)
  }
  async function nextPage() { await goToPage(pageIndex.value + 1) }
  async function prevPage() { await goToPage(pageIndex.value - 1) }

  async function retry() {
    if (fatalStop.value) return
    const st = current.value
    const next = Math.max(1, st.nextApiPage)
    await fetchApiPage(category.value, st.items.length ? next : 1)
  }

  async function setCategory(cat: Category) {
    if (fatalStop.value) {
      category.value = cat
      return
    }
    category.value = cat
    await init(cat)
  }

  // Initialize default category
  init(category.value)

  return {
    category,
    setCategory,
    movies,
    loadedCount,
    total,
    loading,
    error,
    finished,
    loadMore6,
    goToPage,
    nextPage,
    prevPage,
    pageIndex: computed(() => Math.max(1, Math.ceil(current.value.visible / 6))),
    total6Pages: computed(() => total.value ? Math.ceil(total.value / 6) : Math.ceil(current.value.items.length / 6))
  }
}