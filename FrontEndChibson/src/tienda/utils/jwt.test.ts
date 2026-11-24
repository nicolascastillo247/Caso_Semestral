import { describe, expect, test } from 'vitest'
import { crearToken, enSegundos } from '../../test/utilidades'
import { leerToken, tokenExpirado } from './jwt'

describe('lectura del JWT', () => {
  test('leerToken obtiene el RUT y el rol que vienen dentro del token', () => {
    const token = crearToken({ sub: '11111111-1', rol: 'CLIENTE' })

    expect(leerToken(token)).toMatchObject({ sub: '11111111-1', rol: 'CLIENTE' })
    expect(leerToken('esto-no-es-un-jwt')).toBeNull()
  })

  test('tokenExpirado distingue un token vigente de uno vencido', () => {
    const ahora = Date.now()
    const vigente = crearToken({ exp: enSegundos(ahora + 60_000) }) // vence en 1 minuto
    const vencido = crearToken({ exp: enSegundos(ahora - 60_000) }) // venció hace 1 minuto

    expect(tokenExpirado(vigente, ahora)).toBe(false)
    expect(tokenExpirado(vencido, ahora)).toBe(true)
    expect(tokenExpirado(null, ahora)).toBe(true)
  })
})
