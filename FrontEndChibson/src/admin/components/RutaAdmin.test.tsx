import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, test } from 'vitest'
import { AuthProvider } from '../../tienda/context/AuthContext'
import { guardarSesion, sesionDePrueba } from '../../test/utilidades'
import { RutaAdmin } from './RutaAdmin'

// Arma un router mínimo con el login, la tienda y el panel protegido
const abrir = (ruta: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/" element={<p>Tienda</p>} />
          <Route path="/login" element={<p>Iniciar sesión</p>} />
          <Route path="/admin" element={<RutaAdmin />}>
            <Route index element={<p>Panel de administración</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

describe('RutaAdmin', () => {
  test('sin sesión manda al login', () => {
    abrir('/admin')

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument()
  })

  test('con sesión de administrador y token vigente muestra el panel', () => {
    guardarSesion(sesionDePrueba('ADMINISTRADOR'))
    abrir('/admin')

    expect(screen.getByText('Panel de administración')).toBeInTheDocument()
  })
})
