import { useState, useEffect } from 'react'

const KEY = import.meta.env.VITE_TMDB_KEY

export function useIMDbSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null) // 'no_key' | 'not_found' | 'invalid_key' | string

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    if (!KEY) {
      setError('no_key')
      return
    }

    const controller = new AbortController()
    let active = true

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(query.trim())}&language=pt-BR&include_adult=false`,
          { signal: controller.signal }
        )

        if (!active) return

        if (res.status === 401) {
          setError('invalid_key')
          return
        }

        const data = await res.json()
        if (!active) return

        if (data.results && data.results.length > 0) {
          setResults(data.results)
        } else {
          setResults([])
          setError('not_found')
        }
      } catch (e) {
        if (!active || e.name === 'AbortError') return
        setError('Falha na conexão. Verifique sua internet.')
      } finally {
        if (active) setLoading(false)
      }
    }, 450)

    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { results, loading, error }
}
