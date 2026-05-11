import { createContext, useContext, useState, useEffect } from 'react'

const WatchlistContext = createContext(null)

export const STATUS = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  PENDING: 'pending',
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('anitracker-watchlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('anitracker-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (anime) => {
    setWatchlist((prev) => {
      if (prev.find((a) => a.mal_id === anime.mal_id)) return prev
      return [
        ...prev,
        {
          ...anime,
          status: STATUS.PENDING,
          currentEpisode: 0,
          addedAt: Date.now(),
        },
      ]
    })
  }

  const removeFromWatchlist = (mal_id) => {
    setWatchlist((prev) => prev.filter((a) => a.mal_id !== mal_id))
  }

  const isInWatchlist = (mal_id) => {
    return watchlist.some((a) => a.mal_id === mal_id)
  }

  const updateProgress = (mal_id, currentEpisode) => {
    setWatchlist((prev) =>
      prev.map((a) =>
        a.mal_id === mal_id
          ? { ...a, currentEpisode: Math.max(0, currentEpisode) }
          : a
      )
    )
  }

  const updateStatus = (mal_id, status) => {
    setWatchlist((prev) =>
      prev.map((a) => (a.mal_id === mal_id ? { ...a, status } : a))
    )
  }

  const getAnimeData = (mal_id) => {
    return watchlist.find((a) => a.mal_id === mal_id) || null
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
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