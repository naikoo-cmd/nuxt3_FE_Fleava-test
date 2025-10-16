import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const { tmdbApiKey, tmdbBaseUrl } = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  if (!tmdbApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key missing',
      data: { code: 'TMDB_API_KEY_MISSING' }
    })
  }
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Movie id is required' })
  }

  const isBearer = tmdbApiKey.startsWith('eyJ') || tmdbApiKey.length > 40
  const headers = isBearer ? { Authorization: `Bearer ${tmdbApiKey}` } : undefined
  const withKey = (u: string) => isBearer ? u : `${u}&api_key=${tmdbApiKey}`

  try {
    const [details, credits, external, videos] = await Promise.all([
      $fetch<any>(withKey(`${tmdbBaseUrl}/movie/${id}?language=en-US`), { headers }),
      $fetch<any>(withKey(`${tmdbBaseUrl}/movie/${id}/credits?language=en-US`), { headers }),
      $fetch<any>(withKey(`${tmdbBaseUrl}/movie/${id}/external_ids?language=en-US`), { headers }),
      $fetch<any>(withKey(`${tmdbBaseUrl}/movie/${id}/videos?language=en-US`), { headers })
    ])

    const director = credits.crew?.find((p: any) => p.job === 'Director') || null
    const cast = (credits.cast || []).slice(0, 8)
    const trailer = (videos.results || []).find((v: any) =>
      v.type === 'Trailer' && v.site === 'YouTube'
    )
    const imageBase = 'https://image.tmdb.org/t/p'
    const img = (p: string | null, size: string) => (p ? `${imageBase}/${size}${p}` : '')

    return {
      id: details.id,
      title: details.title,
      original_title: details.original_title,
      overview: details.overview,
      genres: (details.genres || []).map((g: any) => g.name),
      status: details.status,
      original_language: details.original_language,
      spoken_languages: (details.spoken_languages || []).map((l: any) => l.english_name || l.name),
      budget: details.budget,
      revenue: details.revenue,
      runtime: details.runtime,
      release_date: details.release_date,
      poster: img(details.poster_path, 'w780'),
      backdrop: img(details.backdrop_path, 'w1280'),

      director: director ? { id: director.id, name: director.name } : null,
      cast: cast.map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile: img(c.profile_path, 'w185')
      })),

      external: {
        imdb: external.imdb_id ? `https://www.imdb.com/title/${external.imdb_id}` : null,
        facebook: external.facebook_id ? `https://facebook.com/${external.facebook_id}` : null,
        instagram: external.instagram_id ? `https://instagram.com/${external.instagram_id}` : null,
        twitter: external.twitter_id ? `https://x.com/${external.twitter_id}` : null
      },

      trailer: trailer ? {
        site: trailer.site,
        key: trailer.key,
        url: `https://www.youtube.com/watch?v=${trailer.key}`
      } : null
    }
  } catch (e: any) {
    console.error('[tmdb] movie details fetch failed', e)
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage: e?.statusMessage || 'TMDB movie fetch failed',
      data: e?.data
    })
  }
})