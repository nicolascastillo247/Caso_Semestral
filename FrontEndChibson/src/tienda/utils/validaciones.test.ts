import { describe, expect, test } from 'vitest'
import { rutValido } from './validaciones'

describe('rutValido', () => {
  test('acepta un RUT con dígito verificador correcto y rechaza uno incorrecto', () => {
    // Correctos, con o sin puntos y guion
    expect(rutValido('12.345.678-5')).toBe(true)
    expect(rutValido('11111111-1')).toBe(true)
    expect(rutValido('123456785')).toBe(true)
    // Dígito verificador incorrecto, letras en el cuerpo o muy corto
    expect(rutValido('12.345.678-9')).toBe(false)
    expect(rutValido('1234A678-5')).toBe(false)
    expect(rutValido('123')).toBe(false)
  })
})
