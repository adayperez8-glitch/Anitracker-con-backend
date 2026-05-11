import { createContext, useContext, useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const { peticion } = useApi()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
    setCargando(false)
  }, [])

  const login = async (email, password) => {
    const data = await peticion('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }

  const register = async (email, password, name) => {
    const data = await peticion('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
