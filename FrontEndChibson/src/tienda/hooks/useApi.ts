import { useCallback, useEffect, useRef, useState } from 'react'
import { mensajeDeError } from '../api/apiClient'

interface UseApiState<T> {
  datos: T | null
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
}

export const useApi = <T>(consulta: () => Promise<T>, dependencias: unknown[] = []): UseApiState<T> => {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const consultaRef = useRef(consulta)
  consultaRef.current = consulta

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setDatos(await consultaRef.current())
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setCargando(false)
    }
  }, dependencias)

  useEffect(() => {
    void cargar()
  }, [cargar])

  return { datos, cargando, error, recargar: cargar }
}

export default useApi
