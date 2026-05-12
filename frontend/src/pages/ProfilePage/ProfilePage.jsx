import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import styles from './ProfilePage.module.css'

const STATUS_LABELS = {
  WATCHING: 'Viendo',
  COMPLETED: 'Completado',
  PAUSED: 'Pausado',
  PENDING: 'Pendiente',
}

export default function ProfilePage() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { peticion } = useApi()
  const [profile, setProfile] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarPerfil()
  }, [id])

  const cargarPerfil = async () => {
    setCargando(true)
    try {
      const data = await peticion(`/api/users/${id}`, { method: 'GET' })
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return <p className={styles.msg}>Cargando...</p>
  if (error) return <p className={styles.msg}>{error}</p>
  if (!profile) return <p className={styles.msg}>Usuario no encontrado</p>

  const esPropio = usuario?.id === profile.id

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.power && <span className={styles.power}>{profile.power}</span>}
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          {esPropio && (
            <Link to="/my-profile" className={styles.editBtn}>Editar perfil</Link>
          )}
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Animes que ve</h2>
          {profile.animeList?.length === 0 ? (
            <p className={styles.empty}>No tiene animes públicos</p>
          ) : (
            <div className={styles.animeGrid}>
              {profile.animeList?.map((a) => (
                <Link to={`/anime/${a.animeId}`} key={a.id} className={styles.animeCard}>
                  {a.animeImage && (
                    <img src={a.animeImage} alt={a.animeTitle} className={styles.animeImg} />
                  )}
                  <div className={styles.animeInfo}>
                    <p className={styles.animeTitle}>{a.animeTitle}</p>
                    <span className={styles.animeStatus} data-status={a.status}>
                      {STATUS_LABELS[a.status]} · Ep.{a.currentEpisode}
                      {a.totalEpisodes > 0 && `/${a.totalEpisodes}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recomendaciones</h2>
          {profile.recommendations?.length === 0 ? (
            <p className={styles.empty}>No tiene recomendaciones</p>
          ) : (
            <div className={styles.recGrid}>
              {profile.recommendations?.map((r) => (
                <div key={r.id} className={styles.recCard}>
                  {r.animeImage && <img src={r.animeImage} alt={r.animeTitle} className={styles.recImg} />}
                  <div>
                    <p className={styles.recTitle}>{r.animeTitle}</p>
                    {r.description && <p className={styles.recDesc}>{r.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
