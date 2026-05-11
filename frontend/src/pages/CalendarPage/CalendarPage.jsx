import { useEffect, useState } from 'react'
import AnimeCard from '../../components/AnimeCard/AnimeCard'
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard'
import Grid from '../../components/Grid/Grid'
import styles from './CalendarPage.module.css'

const DAYS = [
  { label: 'Lunes', value: 'monday' },
  { label: 'Martes', value: 'tuesday' },
  { label: 'Miércoles', value: 'wednesday' },
  { label: 'Jueves', value: 'thursday' },
  { label: 'Viernes', value: 'friday' },
  { label: 'Sábado', value: 'saturday' },
  { label: 'Domingo', value: 'sunday' },
]

const TODAY = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase()

export default function CalendarPage() {
  const [activeDay, setActiveDay] = useState(TODAY)
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (schedule[activeDay]) return

    const fetchSchedule = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/schedules?filter=${activeDay}&sfw=true&limit=24`
        )
        if (!res.ok) throw new Error('Error al cargar el calendario')
        const data = await res.json()
        const unique = (data.data || []).filter(
          (anime, index, self) => index === self.findIndex((a) => a.mal_id === anime.mal_id)
        )
        setSchedule(prev => ({ ...prev, [activeDay]: unique }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [activeDay, schedule])

  const currentAnimes = schedule[activeDay] || []

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Calendario de <span className={styles.accent}>Emisión</span>
        </h1>
        <p className={styles.sub}>Animes que emiten cada día de la semana</p>
      </section>

      <div className={styles.days}>
        {DAYS.map((d) => (
          <button
            key={d.value}
            className={`${styles.dayBtn} ${activeDay === d.value ? styles.dayBtnActive : ''}`}
            onClick={() => setActiveDay(d.value)}
          >
            {d.label}
            {TODAY === d.value && <span className={styles.todayBadge}>Hoy</span>}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>⚠️ {error}</p>}

      <Grid>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : currentAnimes.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)}
      </Grid>

      {!loading && currentAnimes.length === 0 && !error && (
        <div className={styles.empty}>
          <span>📭</span>
          <p>No hay animes programados para este día</p>
        </div>
      )}
    </main>
  )
}