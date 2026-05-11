import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginPage.module.css'

const NEN_TYPES = [
  { value: 'enhancer',     label: '💪 Enhancer (Nen)',       anime: 'Hunter x Hunter' },
  { value: 'transmuter',   label: '⚡ Transmuter (Nen)',      anime: 'Hunter x Hunter' },
  { value: 'conjurer',     label: '🔮 Conjurer (Nen)',        anime: 'Hunter x Hunter' },
  { value: 'emitter',      label: '🔥 Emitter (Nen)',         anime: 'Hunter x Hunter' },
  { value: 'manipulator',  label: '🧠 Manipulator (Nen)',     anime: 'Hunter x Hunter' },
  { value: 'specialist',   label: '✨ Specialist (Nen)',      anime: 'Hunter x Hunter' },
  { value: 'chakra',       label: '🌀 Chakra Nature (Chakra)',anime: 'Naruto' },
  { value: 'sharingan',    label: '👁️ Sharingan',              anime: 'Naruto' },
  { value: 'haki',         label: '⚫ Haki del Conquistador',  anime: 'One Piece' },
  { value: 'akuma_logia',  label: '🌊 Logia (Akuma no Mi)',   anime: 'One Piece' },
  { value: 'akuma_paramecia', label: '🍈 Paramecia (Akuma no Mi)', anime: 'One Piece' },
  { value: 'fullbring',    label: '🌑 Fullbring',             anime: 'Bleach' },
  { value: 'bankai',       label: '⚔️ Bankai',                anime: 'Bleach' },
  { value: 'titan',        label: '🗿 Poder Titán',           anime: 'Attack on Titan' },
  { value: 'cursed',       label: '🟣 Técnica Maldita',       anime: 'Jujutsu Kaisen' },
  { value: 'demon_mark',   label: '🔴 Marca Demoníaca',       anime: 'Demon Slayer' },
  { value: 'alchemy',      label: '⚙️ Alquimia',              anime: 'Fullmetal Alchemist' },
  { value: 'devil_fruit_model', label: '🐉 Zoan Mítico',      anime: 'One Piece' },
]

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [powerCategory, setPowerCategory] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      if (!name || !email || !password || !powerCategory) {
        setError('Rellena todos los campos')
        return
      }
    } else {
      if (!email || !password) {
        setError('Rellena todos los campos')
        return
      }
    }

    setCargando(true)
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const selectedPower = NEN_TYPES.find(p => p.value === powerCategory)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoBlue}>ANI</span><span className={styles.logoLavender}>TRACKER</span>
        </div>
        <p className={styles.subtitle}>{isRegister ? 'Crea tu cuenta' : 'Accede a tu diario de anime'}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                autoFocus={isRegister}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoFocus={!isRegister}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
            />
          </div>

          {isRegister && (
            <div className={styles.field}>
              <label className={styles.label}>Poder preferido</label>
              <select
                className={styles.select}
                value={powerCategory}
                onChange={e => { setPowerCategory(e.target.value); setError('') }}
              >
                <option value="">— Elige tu poder —</option>
                {NEN_TYPES.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {selectedPower && (
                <p className={styles.powerHint}>de {selectedPower.anime}</p>
              )}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={cargando}>
            {cargando ? '...' : isRegister ? 'Crear cuenta →' : 'Entrar →'}
          </button>
        </form>

        <p className={styles.toggle}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            className={styles.toggleBtn}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  )
}
