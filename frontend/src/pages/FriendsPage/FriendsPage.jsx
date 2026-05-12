import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import styles from './FriendsPage.module.css'

export default function FriendsPage() {
  const { peticion } = useApi()
  const [friends, setFriends] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [receiverId, setReceiverId] = useState('')
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

  const enviarSolicitud = async (e) => {
    e.preventDefault()
    setAddMsg('')
    try {
      await peticion('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ receiverId: parseInt(receiverId) }),
      })
      setAddMsg('Solicitud enviada')
      setReceiverId('')
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
          <form className={styles.addForm} onSubmit={enviarSolicitud}>
            <input
              className={styles.input}
              type="number"
              placeholder="ID del usuario"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
            />
            <button type="submit" className={styles.btn}>Enviar solicitud</button>
          </form>
          {addMsg && <p className={addMsg === 'Solicitud enviada' ? styles.success : styles.errorMsg}>{addMsg}</p>}
        </div>

        <section>
          <h2 className={styles.sectionTitle}>Mis amigos ({friends.length})</h2>
          {error && <p className={styles.errorMsg}>{error}</p>}
          {friends.length === 0 ? (
            <p className={styles.empty}>Aún no tienes amigos. ¡Envía una solicitud!</p>
          ) : (
            <div className={styles.grid}>
              {friends.map((f) => (
                <div key={f.friendshipId} className={styles.card}>
                  <Link to={`/profile/${f.user.id}`} className={styles.cardLink}>
                    <div className={styles.avatar}>
                      {f.user.name.charAt(0).toUpperCase()}
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
