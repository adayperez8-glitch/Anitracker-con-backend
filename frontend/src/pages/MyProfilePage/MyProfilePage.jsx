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
  const { usuario, logout, actualizarUsuario } = useAuth()
  const { peticion } = useApi()
  const [name, setName] = useState('')
  const [power, setPower] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [cargando, setCargando] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

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
      setAvatar(data.avatar || '')
    } catch {
      setMsg('Error al cargar perfil')
    } finally {
      setCargando(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const body = { name, power, bio, avatar: avatarPreview || avatar }
      if (newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }
      await peticion('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setMsg('Perfil actualizado')
      setCurrentPassword('')
      setNewPassword('')
      setAvatarFile(null)
      actualizarUsuario({ name, avatar: avatarPreview || avatar })
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

          <div className={styles.field}>
            <label className={styles.label}>Foto de perfil</label>
            <div className={styles.avatarRow}>
              <div className={styles.avatarPreview}>
                {(avatarPreview || avatar) ? (
                  <img src={avatarPreview || avatar} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarLetter}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña actual</label>
            <input
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Contraseña actual"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nueva contraseña</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
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

        <div className={styles.requests}>
          <h2 className={styles.sectionTitle}>Mis recomendaciones</h2>
          <Recomendaciones peticion={peticion} />
        </div>
      </div>
    </div>
  )
}

function Recomendaciones({ peticion }) {
  const [list, setList] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [image, setImage] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    peticion('/api/users/me').then(d => setList(d.recommendations || [])).catch(() => {})
  }, [])

  const agregar = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await peticion('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ animeTitle: title, description: desc, animeImage: image }),
      })
      setMsg('Recomendación añadida')
      setTitle(''); setDesc(''); setImage('')
      const d = await peticion('/api/users/me')
      setList(d.recommendations || [])
    } catch (err) { setMsg(err.message) }
  }

  const eliminar = async (id) => {
    try {
      await peticion(`/api/recommendations/${id}`, { method: 'DELETE' })
      setList(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  return (
    <div>
      <form className={styles.form} onSubmit={agregar}>
        <div className={styles.field}>
          <label className={styles.label}>Título del anime</label>
          <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Shingeki no Kyojin" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>URL de imagen</label>
          <input className={styles.input} value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Descripción</label>
          <textarea className={styles.textarea} value={desc} onChange={e => setDesc(e.target.value)} rows={2} maxLength={500} />
        </div>
        {msg && <p className={styles.success}>{msg}</p>}
        <button type="submit" className={styles.btn}>Añadir recomendación</button>
      </form>
      {list.length === 0 ? (
        <p className={styles.empty}>No tienes recomendaciones aún</p>
      ) : (
        <div className={styles.requestList}>
          {list.map(r => (
            <div key={r.id} className={styles.requestCard}>
              <div>
                {r.animeImage && <img src={r.animeImage} alt={r.animeTitle} style={{width:50,height:70,objectFit:'cover',borderRadius:6}} />}
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:600}}>{r.animeTitle}</p>
                {r.description && <p style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>{r.description}</p>}
              </div>
              <button className={styles.rejectBtn} onClick={() => eliminar(r.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
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
            {r.requester.avatar ? (
              <img src={r.requester.avatar} alt={r.requester.name} className={styles.avatarImg} />
            ) : (
              r.requester.name.charAt(0).toUpperCase()
            )}
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
