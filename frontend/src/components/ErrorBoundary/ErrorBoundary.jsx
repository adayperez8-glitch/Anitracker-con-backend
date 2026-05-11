import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <span className={styles.icon}>💥</span>
            <h2 className={styles.title}>Algo salió mal</h2>
            <p className={styles.message}>{this.state.error?.message || 'Error inesperado'}</p>
            <button className={styles.button} onClick={() => this.setState({ hasError: false })}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
