import { createContext, useContext, useState, useCallback } from 'react'

const AnimeContext = createContext(null)

const BASE_URL = 'https://api.jikan.moe/v4'

export function AnimeProvider({ children }) {
  const [results, setResults] = useState([])
  const [animeDetail, setAnimeDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const search = useCallback(async (query, page = 1, genre = '', type = '') => {
    if (!query.trim()) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    try {
      let url = `${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12&sfw=true`
      if (genre) url += `&genres=${genre}`
      if (type) url += `&type=${type}`
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error('Error al buscar. Inténtalo de nuevo.')
      const data = await res.json()
      if (!data.data || data.data.length === 0) {
        throw new Error(`No se encontraron resultados para "${query}"`)
      }
      setResults(data.data)
      setPagination(data.pagination)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setResults([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
    return () => controller.abort()
  }, [])

  const fetchTopAnime = useCallback(async (filter = 'airing', page = 1) => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${BASE_URL}/top/anime?filter=${filter}&page=${page}&limit=12`,
        { signal: controller.signal }
      )
      if (!res.ok) throw new Error('Error al cargar los animes.')
      const data = await res.json()
      setResults(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
    return () => controller.abort()
  }, [])

  const fetchById = useCallback(async (id) => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setAnimeDetail(null)
    try {
      const res = await fetch(`${BASE_URL}/anime/${id}/full`, { signal: controller.signal })
      if (!res.ok) throw new Error('No se pudo cargar el anime.')
      const data = await res.json()
      setAnimeDetail(data.data)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setLoading(false)
    }
    return () => controller.abort()
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setPagination(null)
    setError(null)
  }, [])

  return (
    <AnimeContext.Provider
      value={{
        results,
        animeDetail,
        loading,
        error,
        pagination,
        search,
        fetchTopAnime,
        fetchById,
        clearResults,
      }}
    >
      {children}
    </AnimeContext.Provider>
  )
}

export function useAnime() {
  const ctx = useContext(AnimeContext)
  if (!ctx) throw new Error('useAnime must be used inside AnimeProvider')
  return ctx
}