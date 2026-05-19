import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import styles from './FriendsPage.module.css'

export default function FriendsPage() {
  const { peticion } = useApi()
  const [friends, setFriends] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  useEffect(() => {
    cargarAmigos()
  }, [])

  const cargarAmigos = async () => {
    try {
      const data = await peticion('/api/friends')
      setFriends(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const buscarUsuarios = async (q) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const data = await peticion(`/api/users?q=${encodeURIComponent(q)}`)
      setSearchResults(data.filter((u) => u.id !== JSON.parse(localStorage.getItem('usuario') || '{}').id))
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const enviarSolicitud = async (receiverName) => {
    setAddMsg('')
    try {
      await peticion('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ receiverName }),
      })
      setAddMsg(`Solicitud enviada a ${receiverName}`)
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      setAddMsg(err.message)
    }
  }

  const eliminarAmigo = async (friendshipId) => {
    try {
      await peticion(`/api/friends/${friendshipId}`, { method: 'DELETE' })
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId))
    } catch {
      //
    }
  }

  if (cargando) return <p className={styles.msg}>Cargando...</p>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Amigos</h1>

        <div className={styles.addSection}>
          <h2 className={styles.sectionTitle}>Añadir amigo</h2>
          <div className={styles.addForm}>
            <input
              className={styles.input}
              placeholder="Buscar usuario por nombre..."
              value={searchQuery}
              onChange={(e) => buscarUsuarios(e.target.value)}
            />
          </div>
          {searching && <p className={styles.msg}>Buscando...</p>}
          {!searching && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((u) => (
                <div key={u.id} className={styles.searchCard}>
                  <div className={styles.avatar}>
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className={styles.avatarImg} />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className={styles.friendName}>{u.name}</p>
                    {u.power && <span className={styles.power}>{u.power}</span>}
                  </div>
                  <button className={styles.btn} onClick={() => enviarSolicitud(u.name)}>
                    + Amigo
                  </button>
                </div>
              ))}
            </div>
          )}
          {!searching && searchQuery && searchResults.length === 0 && (
            <p className={styles.msg}>No se encontraron usuarios</p>
          )}
          {addMsg && <p className={addMsg.startsWith('Solicitud enviada') ? styles.success : styles.errorMsg}>{addMsg}</p>}
        </div>

        <section>
          <h2 className={styles.sectionTitle}>Mis amigos ({friends.length})</h2>
          {error && <p className={styles.errorMsg}>{error}</p>}
          {friends.length === 0 ? (
            <p className={styles.empty}>Aún no tienes amigos. ¡Busca y envía una solicitud!</p>
          ) : (
            <div className={styles.grid}>
              {friends.map((f) => (
                <div key={f.friendshipId} className={styles.card}>
                  <Link to={`/profile/${f.user.id}`} className={styles.cardLink}>
                    <div className={styles.avatar}>
                      {f.user.avatar ? (
                        <img src={f.user.avatar} alt={f.user.name} className={styles.avatarImg} />
                      ) : (
                        f.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className={styles.friendName}>{f.user.name}</p>
                      {f.user.power && <span className={styles.power}>{f.user.power}</span>}
                    </div>
                  </Link>
                  <div className={styles.actions}>
                    <Link to={`/chat?user=${f.user.id}`} className={styles.chatBtn}>
                      Chat
                    </Link>
                    <button className={styles.removeBtn} onClick={() => eliminarAmigo(f.friendshipId)}>
                      ✕
                    </button>
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
