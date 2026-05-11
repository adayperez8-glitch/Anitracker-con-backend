import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '../../context/WatchlistContext'
import styles from './AnimeCard.module.css'

const SCORE_COLOR = (score) => {
  if (!score) return 'var(--color-text-muted)'
  if (score >= 8) return '#3a7bd5'
  if (score >= 6) return '#7c6fd0'
  return '#9b8ee0'
}

const AnimeCard = memo(function AnimeCard({ anime }) {
  const navigate = useNavigate()
  const { isInWatchlist } = useWatchlist()

  const inList = isInWatchlist(anime.mal_id)
  const score = anime.score
  const episodes = anime.episodes || '?'
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/anime/${anime.mal_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/anime/${anime.mal_id}`)}
    >
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={anime.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage}>🎌</div>
        )}
        {inList && <span className={styles.inListBadge}>✓ En mi lista</span>}
        {score && (
          <span className={styles.score} style={{ color: SCORE_COLOR(score) }}>
            ★ {score}
          </span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{anime.title}</h3>
        <div className={styles.meta}>
          <span className={styles.episodes}>{episodes} eps</span>
          {anime.year && <span className={styles.year}>{anime.year}</span>}
        </div>
      </div>
    </article>
  )
})

export default AnimeCard