import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Paginacion } from './Paginacion'

describe('Paginacion', () => {
  test('deshabilita la página actual y avanza a la siguiente al hacer clic', async () => {
    const onCambiar = vi.fn()
    render(<Paginacion paginaActual={2} totalPaginas={3} totalRegistros={25} nombre={['venta', 'ventas']} onCambiar={onCambiar} />)

    expect(screen.getByRole('button', { name: '2' })).toBeDisabled()
    expect(screen.getByText('25 ventas')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(onCambiar).toHaveBeenCalledWith(3)
  })
})
