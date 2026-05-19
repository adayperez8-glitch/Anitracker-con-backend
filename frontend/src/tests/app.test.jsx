import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { WatchlistProvider, useWatchlist } from '../context/WatchlistContext'
import { AnimeProvider, useAnime } from '../context/AnimeContext'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'

// ─── Test 1: WatchlistContext ────────────────────────────────────────────────

function WatchlistConsumer() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, cargando } = useWatchlist()
  const fakeAnime = { mal_id: 1, title: 'Naruto', images: {}, episodes: 220 }
  return (
    <div>
      <p data-testid="loading">{cargando ? 'yes' : 'no'}</p>
      <p data-testid="count">{watchlist.length}</p>
      <p data-testid="inList">{isInWatchlist(1) ? 'yes' : 'no'}</p>
      <button onClick={() => addToWatchlist(fakeAnime)}>Add</button>
      <button onClick={() => removeFromWatchlist(1)}>Remove</button>
    </div>
  )
}

describe('WatchlistContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts empty', async () => {
    render(
      <AuthProvider>
        <WatchlistProvider>
          <WatchlistConsumer />
        </WatchlistProvider>
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('no')
    })
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('inList').textContent).toBe('no')
  })

  it('adds and removes anime correctly', async () => {
    const fetchMock = vi.fn()
    // GET /api/anime (fetch on mount)
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] })
    // POST /api/anime (add)
    fetchMock.mockResolvedValueOnce({
      ok: true, json: async () => ({ id: 1, animeId: 1, animeTitle: 'Naruto', currentEpisode: 0 }),
    })
    // DELETE /api/anime/1 (remove)
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => {} })

    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('usuario', JSON.stringify({ id: 1, name: 'Test' }))

    render(
      <AuthProvider>
        <WatchlistProvider>
          <WatchlistConsumer />
        </WatchlistProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('no')
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Add'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
      expect(screen.getByTestId('inList').textContent).toBe('yes')
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Remove'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('0')
      expect(screen.getByTestId('inList').textContent).toBe('no')
    })

    localStorage.removeItem('token')
  })

  it('does not add duplicates', async () => {
    const fetchMock = vi.fn()
    // GET /api/anime (fetch on mount) - empty
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] })
    // POST /api/anime (first add)
    fetchMock.mockResolvedValueOnce({
      ok: true, json: async () => ({ id: 1, animeId: 1, animeTitle: 'Naruto', currentEpisode: 0 }),
    })

    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('usuario', JSON.stringify({ id: 1, name: 'Test' }))

    render(
      <AuthProvider>
        <WatchlistProvider>
          <WatchlistConsumer />
        </WatchlistProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('no')
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Add'))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Add'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
    })

    localStorage.removeItem('token')
  })
})

// ─── Test 2: AnimeContext ────────────────────────────────────────────────────

const MOCK_RESULTS = [
  { mal_id: 1, title: 'Naruto', score: 8, episodes: 220, year: 2002, images: { jpg: {} } },
  { mal_id: 2, title: 'Bleach', score: 7.9, episodes: 366, year: 2004, images: { jpg: {} } },
]

function AnimeConsumer() {
  const { results, loading, error, search } = useAnime()
  return (
    <div>
      <p data-testid="loading">{loading ? 'yes' : 'no'}</p>
      <p data-testid="error">{error || ''}</p>
      <p data-testid="count">{results.length}</p>
      <button onClick={() => search('naruto')}>Search</button>
      <button onClick={() => search('xyzinexistent999')}>SearchEmpty</button>
    </div>
  )
}

describe('AnimeContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes results after a successful search', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: MOCK_RESULTS,
        pagination: { last_visible_page: 1, has_next_page: false },
      }),
    }))

    render(
      <AnimeProvider>
        <AnimeConsumer />
      </AnimeProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Search'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2')
      expect(screen.getByTestId('loading').textContent).toBe('no')
    })
  })

  it('sets error when search returns no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }))

    render(
      <AnimeProvider>
        <AnimeConsumer />
      </AnimeProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('SearchEmpty'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('No se encontraron')
      expect(screen.getByTestId('count').textContent).toBe('0')
    })
  })
})

// ─── Test 3: AnimeCard ───────────────────────────────────────────────────────

import AnimeCard from '../components/AnimeCard/AnimeCard'

const mockAnime = {
  mal_id: 42,
  title: 'Attack on Titan',
  score: 9.0,
  episodes: 87,
  year: 2013,
  images: { jpg: { large_image_url: 'https://example.com/img.jpg' } },
}

describe('AnimeCard', () => {
  it('renders title and score', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <WatchlistProvider>
            <AnimeCard anime={mockAnime} />
          </WatchlistProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    expect(screen.getByText('★ 9')).toBeInTheDocument()
  })

  it('shows episode count', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <WatchlistProvider>
            <AnimeCard anime={mockAnime} />
          </WatchlistProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('87 eps')).toBeInTheDocument()
  })
})
