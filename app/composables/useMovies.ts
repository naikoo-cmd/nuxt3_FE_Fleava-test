export function useMovies() {
  // Demo data (royalty-free images via Unsplash)
  const slides = [
    {
      id: 's1',
      title: 'Starlight Odyssey',
      overview: 'A crew embarks on a journey beyond the known galaxy.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 's2',
      title: 'Neon City Nights',
      overview: 'A detective unravels a cyber mystery at dusk.',
      image:
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 's3',
      title: 'Into the Wilderness',
      overview: 'Survival against the elements and the past.',
      image:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop'
    }
  ]

  const popular = [
    {
      id: 'p1',
      title: 'Crimson Horizon',
      poster:
        'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop',
      year: 2024,
      rating: 8.4
    },
    {
      id: 'p2',
      title: 'Echoes of Time',
      poster:
        'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=800&auto=format&fit=crop',
      year: 2023,
      rating: 7.9
    },
    {
      id: 'p3',
      title: 'Midnight Run',
      poster:
        'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=800&auto=format&fit=crop',
      year: 2022,
      rating: 8.1
    },
    {
      id: 'p4',
      title: 'Aurora',
      poster:
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=800&auto=format&fit=crop',
      year: 2024,
      rating: 8.2
    },
    {
      id: 'p5',
      title: 'Last Frontier',
      poster:
        'https://images.unsplash.com/photo-1498747946579-bde604cb8f44?q=80&w=800&auto=format&fit=crop',
      year: 2021,
      rating: 7.6
    },
    {
      id: 'p6',
      title: 'Silent Waves',
      poster:
        'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=800&auto=format&fit=crop',
      year: 2020,
      rating: 7.8
    }
  ]

  return { slides, popular }
}