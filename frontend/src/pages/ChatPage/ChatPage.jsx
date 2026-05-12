import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const friendId = searchParams.get('user')
  const { usuario } = useAuth()
  const { peticion } = useApi()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [friends, setFriends] = useState([])
  const [selectedChat, setSelectedChat] = useState(friendId || 'general')
  const bottomRef = useRef(null)

  useEffect(() => {
    cargarAmigos()
  }, [])

  useEffect(() => {
    if (selectedChat) cargarMensajes()
  }, [selectedChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const cargarAmigos = async () => {
    try {
      const data = await peticion('/api/friends')
      setFriends(data)
    } catch {
      setFriends([])
    }
  }

  const cargarMensajes = async () => {
    setCargando(true)
    setError('')
    try {
      const query = selectedChat === 'general' ? '' : `?receiverId=${selectedChat}`
      const data = await peticion(`/api/messages${query}`)
      setMessages(data)
    } catch {
      setMessages([])
      setError('Error al cargar mensajes')
    } finally {
      setCargando(false)
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      const body = { content }
      if (selectedChat !== 'general') body.receiverId = parseInt(selectedChat)
      const msg = await peticion('/api/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setMessages((prev) => [...prev, msg])
      setContent('')
    } catch {
      //
    }
  }

  const chatName = selectedChat === 'general'
    ? 'Chat General'
    : friends.find((f) => f.user.id === parseInt(selectedChat))?.user.name || 'Chat privado'

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <button
            className={`${styles.chatOption} ${selectedChat === 'general' ? styles.active : ''}`}
            onClick={() => setSelectedChat('general')}
          >
            🗣️ Chat General
          </button>
          <p className={styles.sidebarLabel}>Privados</p>
          {friends.map((f) => (
            <button
              key={f.friendshipId}
              className={`${styles.chatOption} ${selectedChat === String(f.user.id) ? styles.active : ''}`}
              onClick={() => setSelectedChat(String(f.user.id))}
            >
              <span className={styles.dot} />
              {f.user.name}
            </button>
          ))}
          {friends.length === 0 && (
            <p className={styles.noFriends}>Añade amigos para chatear</p>
          )}
        </div>

        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <h2 className={styles.chatName}>{chatName}</h2>
          </div>

          <div className={styles.messages}>
            {cargando ? (
              <p className={styles.loading}>Cargando...</p>
            ) : error ? (
              <p className={styles.empty}>{error}</p>
            ) : messages.length === 0 ? (
              <p className={styles.empty}>No hay mensajes aún</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.message} ${m.senderId === usuario?.id ? styles.own : ''}`}
                >
                  {m.senderId !== usuario?.id && (
                    <span className={styles.senderName}>{m.sender.name}</span>
                  )}
                  <p className={styles.msgContent}>{m.content}</p>
                  <span className={styles.time}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form className={styles.inputArea} onSubmit={enviar}>
            <input
              className={styles.input}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button type="submit" className={styles.sendBtn} disabled={!content.trim()}>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
