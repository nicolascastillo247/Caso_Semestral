import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { CampoTexto } from './CampoTexto'

describe('CampoTexto', () => {
  test('marca el campo en rojo y muestra el mensaje cuando tiene un error', () => {
    render(<CampoTexto id="rut" etiqueta="RUT" error="El RUT no es válido" />)

    const campo = screen.getByLabelText('RUT')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('El RUT no es válido')
  })
})
