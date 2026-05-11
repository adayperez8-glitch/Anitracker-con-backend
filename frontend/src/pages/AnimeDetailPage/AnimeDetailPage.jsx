import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAnime } from '../../context/AnimeContext'
import { useWatchlist, STATUS } from '../../context/WatchlistContext'
import styles from './AnimeDetailPage.module.css'

const STATUS_LABELS = {
  [STATUS.WATCHING]: { label: 'Viendo', emoji: '👀' },
  [STATUS.COMPLETED]: { label: 'Completado', emoji: '✅' },
  [STATUS.PAUSED]: { label: 'Pausado', emoji: '⏸️' },
  [STATUS.PENDING]: { label: 'Pendiente', emoji: '📋' },
}

export default function AnimeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchById, loading, error, animeDetail: anime } = useAnime()
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, updateProgress, updateStatus, getAnimeData } = useWatchlist()

  const inList = isInWatchlist(Number(id))
  const listData = getAnimeData(Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchById(id)
  }, [id, fetchById])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando anime...</p>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className={styles.errorContainer}>
        <span>💔</span>
        <h2>No se pudo cargar el anime</h2>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>← Volver</button>
      </div>
    )
  }

  const image = anime.images?.jpg?.large_image_url
  const genres = anime.genres?.map((g) => g.name).join(', ') || '—'
  const studios = anime.studios?.map((s) => s.name).join(', ') || '—'
  const totalEps = anime.episodes || '?'

  return (
    <main className={styles.main}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Volver</button>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.posterWrapper}>
            {image
              ? <img src={image} alt={anime.title} className={styles.poster} />
              : <div className={styles.noPoster}>🎌</div>}
            {anime.score && (
              <div className={styles.scoreBadge}>★ {anime.score}</div>
            )}
          </div>

          {inList ? (
            <div className={styles.listControls}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Capítulo</span>
                <div className={styles.progressControls}>
                  <button
                    className={styles.progressBtn}
                    onClick={() => updateProgress(Number(id), (listData?.currentEpisode || 0) - 1)}
                  >−</button>
                  <span className={styles.progressValue}>
                    {listData?.currentEpisode || 0}
                    <span className={styles.progressTotal}> / {totalEps}</span>
                  </span>
                  <button
                    className={styles.progressBtn}
                    onClick={() => updateProgress(Number(id), (listData?.currentEpisode || 0) + 1)}
                  >+</button>
                </div>
              </div>

              <select
                className={styles.statusSelect}
                value={listData?.status || STATUS.PENDING}
                onChange={(e) => updateStatus(Number(id), e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([val, { label, emoji }]) => (
                  <option key={val} value={val}>{emoji} {label}</option>
                ))}
              </select>

              <button
                className={styles.removeBtn}
                onClick={() => removeFromWatchlist(Number(id))}
              >
                Quitar de mi lista
              </button>
            </div>
          ) : (
            <button
              className={styles.addBtn}
              onClick={() => addToWatchlist({ ...anime, mal_id: Number(id) })}
            >
              + Añadir a mi lista
            </button>
          )}
        </aside>

        <div className={styles.content}>
          <h1 className={styles.title}>{anime.title}</h1>
          {anime.title_english && anime.title_english !== anime.title && (
            <p className={styles.titleEn}>{anime.title_english}</p>
          )}

          <div className={styles.tags}>
            {anime.genres?.map((g) => (
              <span key={g.mal_id} className={styles.tag}>{g.name}</span>
            ))}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Episodios</span>
              <span className={styles.statValue}>{anime.episodes || '?'}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Estado</span>
              <span className={styles.statValue}>{anime.status || '—'}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Año</span>
              <span className={styles.statValue}>{anime.year || '—'}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Rating</span>
              <span className={`${styles.statValue} ${styles.scoreValue}`}>
                ★ {anime.score || '—'}
              </span>
            </div>
          </div>

          {anime.synopsis && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Sinopsis</h2>
              <p className={styles.synopsis}>{anime.synopsis}</p>
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Estudio</span>
              <span className={styles.infoValue}>{studios}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Géneros</span>
              <span className={styles.infoValue}>{genres}</span>
            </div>
            {anime.rating && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Clasificación</span>
                <span className={styles.infoValue}>{anime.rating}</span>
              </div>
            )}
            {anime.duration && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Duración</span>
                <span className={styles.infoValue}>{anime.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}