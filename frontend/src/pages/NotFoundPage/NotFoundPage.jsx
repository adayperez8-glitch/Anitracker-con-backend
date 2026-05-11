import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.text}>
          Esta página no existe o fue movida a otro sitio.
        </p>
        <Link to="/" className={styles.homeLink}>← Volver al inicio</Link>
      </div>
    </main>
  )
}
