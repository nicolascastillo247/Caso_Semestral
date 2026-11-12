// Validaciones del lado del cliente. Son las MISMAS reglas que usa ms-usuarios (Validaciones.java),
// así el usuario ve qué campo está mal antes de enviar el formulario.

// RUT chileno con dígito verificador (módulo 11). Acepta puntos, guion y K minúscula.
export const rutValido = (rut: string) => {
  const limpio = rut.replace(/[.\-\s]/g, '').toUpperCase()
  if (limpio.length < 8 || limpio.length > 9) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false

  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === esperado
}

export const correoValido = (correo: string) => /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(correo.trim())

// Requisitos de la contraseña por separado, para mostrarlos como lista mientras se escribe
export const requisitosPassword = (password: string) => ({
  largo: password.length >= 8,
  letra: /[A-Za-z]/.test(password),
  numero: /\d/.test(password),
})

export const passwordValida = (password: string) => Object.values(requisitosPassword(password)).every(Boolean)

// El backend responde un solo mensaje (por ejemplo "El correo ya está registrado").
// Esta función adivina a qué campo corresponde, para marcarlo en rojo.
export const campoDelMensaje = (mensaje: string): string | null => {
  const texto = mensaje.toLowerCase()
  if (texto.includes('rut')) return 'rut'
  if (texto.includes('correo')) return 'correo'
  if (texto.includes('no coinciden') || texto.includes('confirmar')) return 'confirmarPassword'
  if (texto.includes('contraseña')) return 'password'
  if (texto.includes('nombre de usuario')) return 'username'
  if (texto.includes('primer apellido')) return 'primerApellido'
  if (texto.includes('segundo apellido')) return 'segundoApellido'
  if (texto.includes('nombres')) return 'nombres'
  return null
}
