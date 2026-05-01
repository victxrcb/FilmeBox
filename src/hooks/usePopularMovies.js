import { useState, useEffect } from 'react'

const KEY = import.meta.env.VITE_TMDB_KEY

export function usePopularMovies() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!KEY) { setError('no_key'); return }

    const controller = new AbortController()
    setLoading(true)

    async function load() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_date.gte=2024-01-01&include_adult=false&vote_count.gte=50`,
          { signal: controller.signal }
        )
        if (res.status === 401) { setError('invalid_key'); return }
        const data = await res.json()
        setResults(data.results ?? [])
      } catch (e) {
        if (e.name === 'AbortError') return
        setError('Falha na conexão. Verifique sua internet.')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return { results, loading, error }
}
