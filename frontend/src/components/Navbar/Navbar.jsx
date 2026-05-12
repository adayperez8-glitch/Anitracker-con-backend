import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWatchlist } from '../../context/WatchlistContext'
import styles from './Navbar.module.css'

const WALLPAPERS = [
  { label: '🌸 Default', value: 'none' },
  { label: '🍥 Naruto', value: 'https://w.wallhaven.cc/full/wq/wallhaven-wq85er.jpg' },
  { label: '⚔️ Attack on Titan', value: 'https://w.wallhaven.cc/full/4d/wallhaven-4dlm83.jpg' },
  { label: '🔥 Demon Slayer', value: 'https://w.wallhaven.cc/full/rd/wallhaven-rdxk2j.jpg' },
  { label: '🏴‍☠️ One Piece', value: 'https://w.wallhaven.cc/full/j3/wallhaven-j3d6rm.png' },
  { label: '🟣 Jujutsu Kaisen', value: 'https://w.wallhaven.cc/full/5g/wallhaven-5g8775.png' },
  { label: '🗿 Berserk', value: 'https://w.wallhaven.cc/full/l3/wallhaven-l3zyd2.jpg' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [wallpaper, setWallpaper] = useState('none')
  const { usuario, logout } = useAuth()
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleWallpaper = (value) => {
    setWallpaper(value)
    if (value === 'none') {
      document.body.style.backgroundImage = 'radial-gradient(ellipse at 20% 0%, rgba(124, 111, 208, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(58, 123, 213, 0.05) 0%, transparent 50%)'
      document.body.style.backgroundSize = ''
      document.body.style.backgroundAttachment = ''
      document.documentElement.style.setProperty('--color-text-primary', '#2a2060')
      document.documentElement.style.setProperty('--color-text-secondary', '#6a62a0')
      document.documentElement.style.setProperty('--color-text-muted', '#aaa8cc')
      document.documentElement.style.setProperty('--color-bg-card', '#f4f4fb')
      document.documentElement.style.setProperty('--color-bg-elevated', '#eeeef8')
    } else {
      document.body.style.backgroundImage = `url(${value})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundAttachment = 'fixed'
      document.documentElement.style.setProperty('--color-text-primary', '#ffffff')
      document.documentElement.style.setProperty('--color-text-secondary', '#ffffff')
      document.documentElement.style.setProperty('--color-text-muted', '#3a7bd5')
      document.documentElement.style.setProperty('--color-bg-card', 'rgba(255, 255, 255, 0.15)')
      document.documentElement.style.setProperty('--color-bg-elevated', 'rgba(255, 255, 255, 0.1)')
    }
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAccent}>ANI</span>TRACKER
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>

        <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Buscar
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Usuarios
            </NavLink>
          </li>
          <li>
            <NavLink to="/friends" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Amigos
            </NavLink>
          </li>
          <li>
            <NavLink to="/chat" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink to="/mylist" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Mi Lista
              {watchlist.length > 0 && (
                <span className={styles.badge}>{watchlist.length}</span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
              Calendario
            </NavLink>
          </li>
          <li>
            <select
              className={styles.wallpaperSelect}
              value={wallpaper}
              onChange={(e) => handleWallpaper(e.target.value)}
            >
              {WALLPAPERS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </li>
          {usuario && (
            <li>
              <NavLink to="/my-profile" className={({ isActive }) => isActive ? styles.activeLink : styles.link} onClick={() => setMenuOpen(false)}>
                👤 {usuario.name}
              </NavLink>
            </li>
          )}
          {usuario && (
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Salir
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
