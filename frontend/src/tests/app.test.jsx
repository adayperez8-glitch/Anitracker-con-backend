import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { WatchlistProvider, useWatchlist } from '../context/WatchlistContext'
import { AnimeProvider, useAnime } from '../context/AnimeContext'
import { MemoryRouter } from 'react-router-dom'

// ─── Test 1: WatchlistContext ────────────────────────────────────────────────

function WatchlistConsumer() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const fakeAnime = { mal_id: 1, title: 'Naruto', images: {}, episodes: 220 }
  return (
    <div>
      <p data-testid="count">{watchlist.length}</p>
      <p data-testid="inList">{isInWatchlist(1) ? 'yes' : 'no'}</p>
      <button onClick={() => addToWatchlist(fakeAnime)}>Add</button>
      <button onClick={() => removeFromWatchlist(1)}>Remove</button>
    </div>
  )
}

describe('WatchlistContext', () => {
  it('starts empty', () => {
    render(
      <WatchlistProvider>
        <WatchlistConsumer />
      </WatchlistProvider>
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('inList').textContent).toBe('no')
  })

  it('adds and removes anime correctly', () => {
    render(
      <WatchlistProvider>
        <WatchlistConsumer />
      </WatchlistProvider>
    )
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('inList').textContent).toBe('yes')

    fireEvent.click(screen.getByText('Remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('inList').textContent).toBe('no')
  })

  it('does not add duplicates', () => {
    render(
      <WatchlistProvider>
        <WatchlistConsumer />
      </WatchlistProvider>
    )
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
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
        <WatchlistProvider>
          <AnimeCard anime={mockAnime} />
        </WatchlistProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    expect(screen.getByText('★ 9')).toBeInTheDocument()
  })

  it('shows episode count', () => {
    render(
      <MemoryRouter>
        <WatchlistProvider>
          <AnimeCard anime={mockAnime} />
        </WatchlistProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('87 eps')).toBeInTheDocument()
  })
})