import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, type AxiosResponse } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import AuthService from '../../services/auth.service'
import { sesionDePrueba } from '../../../test/utilidades'
import RegistroPage from './RegistroPage'

// Abre el formulario de registro dentro de un router mínimo
const abrirRegistro = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/registro']}>
        <Routes>
          <Route path="/" element={<p>Inicio de la tienda</p>} />
          <Route path="/registro" element={<RegistroPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

// Llena todo el formulario con datos correctos
const llenarFormulario = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(screen.getByLabelText('RUT'), '11.111.111-1')
  await usuario.type(screen.getByLabelText('Nombres'), 'Ana')
  await usuario.type(screen.getByLabelText('Primer apellido'), 'Pérez')
  await usuario.type(screen.getByLabelText('Segundo apellido'), 'Soto')
  await usuario.type(screen.getByLabelText('Nombre de usuario'), 'anaperez')
  await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.cl')
  await usuario.type(screen.getByLabelText('Contraseña'), 'Prueba123')
  await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'Prueba123')
}

afterEach(() => {
  vi.restoreAllMocks() // devuelve AuthService a la normalidad después de cada prueba
})

describe('Formulario de crear cuenta', () => {
  test('al enviar vacío marca los 8 campos, pone el cursor en el RUT y no llama al backend', async () => {
    const registrar = vi.spyOn(AuthService, 'registrar')
    const usuario = userEvent.setup()
    abrirRegistro()

    await usuario.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(screen.getByText('Hay 8 campos por corregir (marcados en rojo).')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu RUT.')).toBeInTheDocument()
    expect(screen.getByLabelText('RUT')).toHaveFocus()
    expect(registrar).not.toHaveBeenCalled()
  })

  test('avisa si el RUT es inválido al salir del campo y quita el error al corregirlo', async () => {
    const usuario = userEvent.setup()
    abrirRegistro()
    const rut = screen.getByLabelText('RUT')

    await usuario.type(rut, '12.345.678-9') // dígito verificador incorrecto
    await usuario.tab() // salir del campo

    expect(rut).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/El RUT no es válido/)).toBeInTheDocument()

    await usuario.clear(rut)
    await usuario.type(rut, '12.345.678-5') // dígito verificador correcto

    expect(rut).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText(/El RUT no es válido/)).not.toBeInTheDocument()
  })

  test('con datos correctos crea la cuenta, inicia sesión y vuelve a la tienda', async () => {
    const registrar = vi.spyOn(AuthService, 'registrar').mockResolvedValue({} as Awaited<ReturnType<typeof AuthService.registrar>>)
    const login = vi.spyOn(AuthService, 'login').mockResolvedValue(sesionDePrueba('CLIENTE'))
    const usuario = userEvent.setup()
    abrirRegistro()

    await llenarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(registrar).toHaveBeenCalledWith(expect.objectContaining({ rut: '11.111.111-1', correo: 'ana@correo.cl' }))
    expect(login).toHaveBeenCalledWith({ correo: 'ana@correo.cl', password: 'Prueba123' })
    expect(await screen.findByText('Inicio de la tienda')).toBeInTheDocument()
  })

  test('si el backend responde que el correo ya existe, marca el campo correo', async () => {
    const respuesta = { status: 409, data: { message: 'El correo ya está registrado' } } as AxiosResponse
    vi.spyOn(AuthService, 'registrar').mockRejectedValue(new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, respuesta))
    const usuario = userEvent.setup()
    abrirRegistro()

    await llenarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Registrarse' }))

    const correo = screen.getByLabelText('Correo electrónico')
    expect(await screen.findByText('El correo ya está registrado')).toBeInTheDocument()
    expect(correo).toHaveAttribute('aria-invalid', 'true')
    expect(correo).toHaveFocus()
  })
})
