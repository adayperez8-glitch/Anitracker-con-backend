import { useEffect, useState } from 'react'
import { useAnime } from '../../context/AnimeContext'
import AnimeCard from '../../components/AnimeCard/AnimeCard'
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard'
import Grid from '../../components/Grid/Grid'
import styles from './HomePage.module.css'

const FILTERS = [
  { label: 'En emisión', value: 'airing' },
  { label: 'Más populares', value: 'bypopularity' },
  { label: 'Mejor valorados', value: 'favorite' },
  { label: 'Próximamente', value: 'upcoming' },
]

export default function HomePage() {
  const { results, loading, error, pagination, fetchTopAnime } = useAnime()
  const [activeFilter, setActiveFilter] = useState('airing')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchTopAnime(activeFilter, page)
  }, [activeFilter, page, fetchTopAnime])

  const handleFilter = (value) => {
    setActiveFilter(value)
    setPage(1)
  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Top <span className={styles.accent}>Anime</span>
        </h1>
        <p className={styles.heroSub}>Descubre los animes más populares del momento</p>
      </section>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={activeFilter === f.value ? styles.filterActive : styles.filter}
            onClick={() => handleFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>⚠️ {error}</p>}

      <Grid>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : results.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)}
      </Grid>

      {!loading && pagination && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {pagination.last_visible_page}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.has_next_page}
          >
            Siguiente →
          </button>
        </div>
      )}
    </main>
  )
}