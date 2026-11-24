import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, test } from 'vitest'
import type { Producto } from '../services/producto.service'
import { AuthProvider } from './AuthContext'
import { CarritoProvider, useCarrito } from './CarritoContext'

const envoltorio = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <CarritoProvider>{children}</CarritoProvider>
  </AuthProvider>
)

const cajon = { sku: 'PER-0003', modelo: 'Cajón Headliner', marca: 'Meinl', precio: 89990, imagenUrl: null, stockDisponible: 3 } as Producto

describe('Carrito', () => {
  test('suma cantidades del mismo producto sin pasarse del stock y calcula el subtotal', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })

    act(() => result.current.agregar(cajon, 2))
    act(() => result.current.agregar(cajon, 2)) // pide 4 en total, pero solo hay 3

    expect(result.current.items).toHaveLength(1)
    expect(result.current.cantidadTotal).toBe(3)
    expect(result.current.subtotal).toBe(3 * 89990)
  })
})
