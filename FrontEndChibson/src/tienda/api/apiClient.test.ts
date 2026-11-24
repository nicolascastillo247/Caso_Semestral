import type { InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { guardarSesion, sesionDePrueba } from '../../test/utilidades'
import apiClient, { SESION_EXPIRADA } from './apiClient'

// En vez de llamar al backend real, el "adapter" de axios devuelve una respuesta inventada
const adapterOriginal = apiClient.defaults.adapter

afterEach(() => {
  apiClient.defaults.adapter = adapterOriginal
})

describe('apiClient con JWT', () => {
  test('envía el token de la sesión en el encabezado Authorization: Bearer', async () => {
    const sesion = sesionDePrueba('CLIENTE')
    guardarSesion(sesion)
    let enviada: InternalAxiosRequestConfig | undefined
    apiClient.defaults.adapter = async (config) => {
      enviada = config
      return { data: [], status: 200, statusText: 'OK', headers: {}, config }
    }

    await apiClient.get('/api/pedidos/mis-pedidos')

    expect(enviada?.headers.Authorization).toBe(`Bearer ${sesion.token}`)
  })

  test('avisa que la sesión expiró cuando el backend rechaza el token con 401', async () => {
    guardarSesion(sesionDePrueba('CLIENTE'))
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({ config, response: { status: 401, data: { message: 'La sesión expiró' } } })
    const alExpirar = vi.fn()
    window.addEventListener(SESION_EXPIRADA, alExpirar)

    await expect(apiClient.get('/api/pedidos/mis-pedidos')).rejects.toBeDefined()

    expect(alExpirar).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESION_EXPIRADA, alExpirar)
  })
})
