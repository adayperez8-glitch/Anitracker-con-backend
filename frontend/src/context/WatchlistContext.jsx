import { createContext, useContext, useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const WatchlistContext = createContext(null)

export const STATUS = {
  WATCHING: 'WATCHING',
  COMPLETED: 'COMPLETED',
  PAUSED: 'PAUSED',
  PENDING: 'PENDING',
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([])
  const [cargando, setCargando] = useState(true)
  const { peticion } = useApi()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchList()
    } else {
      setCargando(false)
    }
  }, [])

  const fetchList = async () => {
    try {
      const data = await peticion('/api/anime')
      setWatchlist(data)
    } catch {
      setWatchlist([])
    } finally {
      setCargando(false)
    }
  }

  const addToWatchlist = async (anime) => {
    try {
      const entry = await peticion('/api/anime', {
        method: 'POST',
        body: JSON.stringify({
          animeId: anime.mal_id,
          animeTitle: anime.title,
          animeImage: anime.images?.jpg?.image_url || '',
          totalEpisodes: anime.episodes || 0,
        }),
      })
      setWatchlist((prev) => [...prev, entry])
      return true
    } catch {
      return false
    }
  }

  const removeFromWatchlist = async (animeId) => {
    const entry = watchlist.find((a) => a.animeId === animeId)
    if (!entry) return
    try {
      await peticion(`/api/anime/${entry.id}`, { method: 'DELETE' })
      setWatchlist((prev) => prev.filter((a) => a.animeId !== animeId))
    } catch {
      //
    }
  }

  const isInWatchlist = (animeId) => {
    return watchlist.some((a) => a.animeId === animeId)
  }

  const updateProgress = async (animeId, currentEpisode) => {
    const entry = watchlist.find((a) => a.animeId === animeId)
    if (!entry) return
    const ep = Math.max(0, currentEpisode)
    try {
      const updated = await peticion(`/api/anime/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentEpisode: ep }),
      })
      setWatchlist((prev) => prev.map((a) => (a.id === entry.id ? updated : a)))
    } catch {
      //
    }
  }

  const updateStatus = async (animeId, status) => {
    const entry = watchlist.find((a) => a.animeId === animeId)
    if (!entry) return
    try {
      const updated = await peticion(`/api/anime/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setWatchlist((prev) => prev.map((a) => (a.id === entry.id ? updated : a)))
    } catch {
      //
    }
  }

  const getAnimeData = (animeId) => {
    return watchlist.find((a) => a.animeId === animeId) || null
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        cargando,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        updateProgress,
        updateStatus,
        getAnimeData,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return ctx
}
