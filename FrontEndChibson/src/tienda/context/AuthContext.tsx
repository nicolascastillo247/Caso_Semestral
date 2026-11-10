import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SESION_EXPIRADA, SESION_KEY } from '../api/apiClient'
import AuthService, { type Credenciales, type Sesion } from '../services/auth.service'

interface AuthContextValue {
  sesion: Sesion | null
  estaAutenticado: boolean
  esCliente: boolean
  sesionExpirada: boolean
  iniciarSesion: (credenciales: Credenciales) => Promise<Sesion>
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const leerSesion = (): Sesion | null => {
  try {
    const guardada = localStorage.getItem(SESION_KEY)
    return guardada ? (JSON.parse(guardada) as Sesion) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)
  const [sesionExpirada, setSesionExpirada] = useState(false)

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(SESION_KEY)
    setSesion(null)
  }, [])

  const iniciarSesion = useCallback(async (credenciales: Credenciales) => {
    const nueva = await AuthService.login(credenciales)
    localStorage.setItem(SESION_KEY, JSON.stringify(nueva))
    setSesion(nueva)
    setSesionExpirada(false)
    return nueva
  }, [])

  useEffect(() => {
    const alExpirar = () => {
      cerrarSesion()
      setSesionExpirada(true)
    }
    window.addEventListener(SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(SESION_EXPIRADA, alExpirar)
  }, [cerrarSesion])

  const valor = useMemo<AuthContextValue>(
    () => ({
      sesion,
      estaAutenticado: sesion !== null,
      esCliente: sesion?.rol === 'CLIENTE',
      sesionExpirada,
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion, sesionExpirada, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return contexto
}
