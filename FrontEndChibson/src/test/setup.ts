// Se ejecuta antes de cada archivo de pruebas
import '@testing-library/jest-dom/vitest' // agrega toBeInTheDocument(), toBeDisabled(), etc.
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup() // desmonta lo que renderizó la prueba anterior
  localStorage.clear() // cada prueba parte sin sesión ni carrito guardado
})
