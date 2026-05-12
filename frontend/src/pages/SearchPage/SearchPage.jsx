import { useState } from 'react'
import { useAnime } from '../../context/AnimeContext'
import AnimeCard from '../../components/AnimeCard/AnimeCard'
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard'
import Grid from '../../components/Grid/Grid'
import styles from './SearchPage.module.css'

const GENRES = [
  { label: 'Todos los géneros', value: '' },
  { label: 'Acción', value: '1' },
  { label: 'Aventura', value: '2' },
  { label: 'Comedia', value: '4' },
  { label: 'Drama', value: '8' },
  { label: 'Fantasy', value: '10' },
  { label: 'Horror', value: '14' },
  { label: 'Misterio', value: '7' },
  { label: 'Romance', value: '22' },
  { label: 'Ciencia ficción', value: '24' },
  { label: 'Slice of Life', value: '36' },
  { label: 'Sobrenatural', value: '37' },
  { label: 'Thriller', value: '41' },
]

const TYPES = [
  { label: 'Todos los tipos', value: '' },
  { label: 'TV', value: 'tv' },
  { label: 'Película', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'Especial', value: 'special' },
  { label: 'ONA', value: 'ona' },
]

export default function SearchPage() {
  const { results, loading, error, pagination, search } = useAnime()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [genre, setGenre] = useState('')
  const [type, setType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSubmittedQuery(query)
    setPage(1)
    search(query, 1, genre, type)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    search(submittedQuery, newPage, genre, type)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = () => {
    if (!submittedQuery) return
    setPage(1)
    search(submittedQuery, 1, genre, type)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <span className={styles.accent}>Buscar</span> Anime
      </h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ej: Naruto, Attack on Titan, One Piece..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={genre}
          onChange={(e) => { setGenre(e.target.value); handleFilterChange() }}
        >
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={type}
          onChange={(e) => { setType(e.target.value); handleFilterChange() }}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {submittedQuery && !error && !loading && results.length > 0 && (
        <p className={styles.resultsInfo}>
          Resultados para <strong>"{submittedQuery}"</strong>
          {pagination && ` — página ${page} de ${pagination.last_visible_page}`}
        </p>
      )}

      <Grid>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : results.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)}
      </Grid>

      {!loading && results.length > 0 && pagination && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            {page} / {pagination.last_visible_page}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.has_next_page}
          >
            Siguiente →
          </button>
        </div>
      )}

      {!loading && submittedQuery && !error && results.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>😕</span>
          <p>No se encontraron resultados para <strong>"{submittedQuery}"</strong></p>
        </div>
      )}

      {!loading && !submittedQuery && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>Busca tu anime favorito arriba</p>
        </div>
      )}
    </main>
  )
}