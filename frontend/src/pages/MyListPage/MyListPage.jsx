import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWatchlist, STATUS } from '../../context/WatchlistContext'
import styles from './MyListPage.module.css'

const STATUS_LABELS = {
  [STATUS.WATCHING]: { label: 'Viendo', emoji: '👀' },
  [STATUS.COMPLETED]: { label: 'Completado', emoji: '✅' },
  [STATUS.PAUSED]: { label: 'Pausado', emoji: '⏸️' },
  [STATUS.PENDING]: { label: 'Pendiente', emoji: '📋' },
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: STATUS.WATCHING, label: '👀 Viendo' },
  { value: STATUS.COMPLETED, label: '✅ Completado' },
  { value: STATUS.PAUSED, label: '⏸️ Pausado' },
  { value: STATUS.PENDING, label: '📋 Pendiente' },
]

export default function MyListPage() {
  const { watchlist, removeFromWatchlist, updateProgress, updateStatus } = useWatchlist()
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const filtered = filter === 'all'
    ? watchlist
    : watchlist.filter((a) => a.status === filter)

  if (watchlist.length === 0) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Mi <span className={styles.accent}>Lista</span></h1>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <h2 className={styles.emptyTitle}>Tu lista está vacía</h2>
          <p className={styles.emptyText}>Busca animes y añádelos a tu lista para llevar el control.</p>
          <Link to="/search" className={styles.searchLink}>Ir a Buscar →</Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Mi <span className={styles.accent}>Lista</span>
          <span className={styles.count}>{watchlist.length}</span>
        </h1>
      </div>

      <div className={styles.filters}>
        {STATUS_FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? styles.filterActive : styles.filter}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={styles.noResults}>No tienes animes con este estado.</p>
      )}

      <div className={styles.list}>
        {filtered.map((anime) => {
          const totalEps = anime.episodes || '?'
          const progress = totalEps !== '?' && totalEps > 0
            ? Math.min(100, Math.round((anime.currentEpisode / totalEps) * 100))
            : null
          const statusInfo = STATUS_LABELS[anime.status] || STATUS_LABELS[STATUS.PENDING]
          const image = anime.images?.jpg?.image_url

          return (
            <article key={anime.mal_id} className={styles.item}>
              <div
                className={styles.itemPoster}
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                role="button"
                tabIndex={0}
              >
                {image
                  ? <img src={image} alt={anime.title} className={styles.itemImage} />
                  : <div className={styles.noImage}>🎌</div>}
              </div>

              <div className={styles.itemContent}>
                <div className={styles.itemTop}>
                  <h3
                    className={styles.itemTitle}
                    onClick={() => navigate(`/anime/${anime.mal_id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    {anime.title}
                  </h3>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWatchlist(anime.mal_id)}
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.itemMeta}>
                  <span className={styles.statusBadge} data-status={anime.status}>
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                  {anime.score && (
                    <span className={styles.score}>★ {anime.score}</span>
                  )}
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progreso</span>
                    <div className={styles.progressControls}>
                      <button
                        className={styles.progressBtn}
                        onClick={() => updateProgress(anime.mal_id, anime.currentEpisode - 1)}
                      >−</button>
                      <span className={styles.progressValue}>
                        Cap. <strong>{anime.currentEpisode}</strong>
                        <span className={styles.totalEps}> / {totalEps}</span>
                      </span>
                      <button
                        className={styles.progressBtn}
                        onClick={() => updateProgress(anime.mal_id, anime.currentEpisode + 1)}
                      >+</button>
                    </div>
                  </div>
                  {progress !== null && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                        data-status={anime.status}
                      />
                    </div>
                  )}
                </div>

                <select
                  className={styles.statusSelect}
                  value={anime.status}
                  onChange={(e) => updateStatus(anime.mal_id, e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, { label, emoji }]) => (
                    <option key={val} value={val}>{emoji} {label}</option>
                  ))}
                </select>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}