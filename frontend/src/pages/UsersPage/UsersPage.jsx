import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import styles from './UsersPage.module.css'

const POWERS = [
  { value: '', label: 'Todos los poderes' },
  { value: 'enhancer', label: '💪 Enhancer' },
  { value: 'transmuter', label: '⚡ Transmuter' },
  { value: 'conjurer', label: '🔮 Conjurer' },
  { value: 'emitter', label: '🔥 Emitter' },
  { value: 'manipulator', label: '🧠 Manipulator' },
  { value: 'specialist', label: '✨ Specialist' },
  { value: 'chakra', label: '🌀 Chakra' },
  { value: 'sharingan', label: '👁️ Sharingan' },
  { value: 'haki', label: '⚫ Haki' },
  { value: 'bankai', label: '⚔️ Bankai' },
  { value: 'titan', label: '🗿 Titán' },
  { value: 'cursed', label: '🟣 Maldita' },
  { value: 'demon_mark', label: '🔴 Marca' },
]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [power, setPower] = useState('')
  const { peticion, cargando, error } = useApi()

  useEffect(() => {
    cargarUsuarios()
  }, [power])

  const cargarUsuarios = async () => {
    try {
      const query = power ? `?power=${power}` : ''
      const data = await peticion(`/api/users${query}`)
      setUsers(data)
    } catch {
      setUsers([])
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Explorar usuarios</h1>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={power}
            onChange={(e) => setPower(e.target.value)}
          >
            {POWERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {cargando && <p className={styles.loading}>Cargando...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          {users.map((u) => (
            <Link to={`/profile/${u.id}`} key={u.id} className={styles.card}>
              <div className={styles.avatar}>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className={styles.avatarImg} />
                ) : (
                  u.name.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className={styles.userName}>{u.name}</h3>
              {u.power && (
                <span className={styles.power}>
                  {POWERS.find((p) => p.value === u.power)?.label || u.power}
                </span>
              )}
              {u.bio && <p className={styles.bio}>{u.bio}</p>}
            </Link>
          ))}
        </div>

        {!cargando && users.length === 0 && (
          <p className={styles.empty}>No hay usuarios con ese poder</p>
        )}
      </div>
    </div>
  )
}
