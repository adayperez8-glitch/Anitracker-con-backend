import { useState } from 'react'
import API_URL from '../config/api'

export const useApi = () => {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const peticion = async (endpoint, opciones = {}) => {
    setCargando(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        ...opciones
      })

      const datos = await res.json()

      if (!res.ok) {
        throw new Error(datos.error || 'Error en la petición')
      }

      return datos
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { peticion, cargando, error }
}
