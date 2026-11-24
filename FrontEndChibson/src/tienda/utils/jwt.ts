// Lectura del JWT en el navegador.
// OJO: aquí solo se LEE el contenido del token (por ejemplo, cuándo expira). Quien comprueba
// que el token es auténtico es el gateway del backend, porque solo él conoce la clave secreta.

export interface DatosToken {
  sub?: string // RUT del usuario
  rol?: string
  username?: string
  iat?: number // emitido (segundos desde 1970)
  exp?: number // expira (segundos desde 1970)
}

// Un JWT tiene 3 partes separadas por puntos: encabezado.datos.firma (cada una en Base64URL)
export const leerToken = (token: string): DatosToken | null => {
  try {
    const datos = token.split('.')[1]
    if (!datos) return null
    const base64 = datos.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(datos.length / 4) * 4, '=')
    const contenido: unknown = JSON.parse(atob(base64))
    return typeof contenido === 'object' && contenido !== null ? (contenido as DatosToken) : null
  } catch {
    return null
  }
}

// true si no hay token, si no se puede leer o si ya pasó su fecha de expiración
export const tokenExpirado = (token: string | null | undefined, ahora: number = Date.now()): boolean => {
  if (!token) return true
  const exp = leerToken(token)?.exp
  return typeof exp !== 'number' || exp * 1000 <= ahora
}
