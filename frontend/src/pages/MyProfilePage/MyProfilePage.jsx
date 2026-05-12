import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import styles from './MyProfilePage.module.css'

const POWERS = [
  { value: '', label: 'Sin poder' },
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

export default function MyProfilePage() {
  const { usuario, logout } = useAuth()
  const { peticion } = useApi()
  const [name, setName] = useState('')
  const [power, setPower] = useState('')
  const [bio, setBio] = useState('')
  const [cargando, setCargando] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    setCargando(true)
    try {
      const data = await peticion('/api/users/me')
      setName(data.name)
      setPower(data.power || '')
      setBio(data.bio || '')
    } catch {
      setMsg('Error al cargar perfil')
    } finally {
      setCargando(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await peticion('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, power, bio }),
      })
      setMsg('Perfil actualizado')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (cargando) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Mi perfil</h1>

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label}>Nombre</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Poder</label>
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

          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Cuéntanos algo sobre ti..."
            />
          </div>

          {msg && <p className={msg === 'Perfil actualizado' ? styles.success : styles.error}>{msg}</p>}

          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div className={styles.requests}>
          <h2 className={styles.sectionTitle}>Solicitudes de amistad</h2>
          <FriendRequests peticion={peticion} />
        </div>
      </div>
    </div>
  )
}

function FriendRequests({ peticion }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const data = await peticion('/api/friends/requests')
      setRequests(data)
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const responder = async (id, status) => {
    try {
      await peticion(`/api/friends/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      //
    }
  }

  if (loading) return <p className={styles.loading}>Cargando...</p>
  if (requests.length === 0) return <p className={styles.empty}>No tienes solicitudes pendientes</p>

  return (
    <div className={styles.requestList}>
      {requests.map((r) => (
        <div key={r.id} className={styles.requestCard}>
          <div className={styles.requestAvatar}>
            {r.requester.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.requestName}>{r.requester.name}</p>
            {r.requester.power && (
              <span className={styles.requestPower}>{r.requester.power}</span>
            )}
          </div>
          <div className={styles.requestActions}>
            <button className={styles.acceptBtn} onClick={() => responder(r.id, 'ACCEPTED')}>
              Aceptar
            </button>
            <button className={styles.rejectBtn} onClick={() => responder(r.id, 'REJECTED')}>
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
