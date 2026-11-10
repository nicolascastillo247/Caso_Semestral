import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Producto } from '../services/producto.service'
import { useAuth } from './AuthContext'

export const COSTO_ENVIO = 5000

export interface ItemCarrito {
  sku: string
  modelo: string
  marca: string
  precio: number
  imagenUrl: string | null
  stockDisponible: number
  cantidad: number
}

interface CarritoContextValue {
  items: ItemCarrito[]
  cantidadTotal: number
  subtotal: number
  agregar: (producto: Producto, cantidad?: number) => void
  cambiarCantidad: (sku: string, cantidad: number) => void
  quitar: (sku: string) => void
  vaciar: () => void
}

const CarritoContext = createContext<CarritoContextValue | null>(null)

const claveCarrito = (rut?: string) => `chibson.carrito.${rut ?? 'invitado'}`

const leerCarrito = (rut?: string): ItemCarrito[] => {
  try {
    const guardado = localStorage.getItem(claveCarrito(rut))
    return guardado ? (JSON.parse(guardado) as ItemCarrito[]) : []
  } catch {
    return []
  }
}

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const { sesion } = useAuth()
  const rut = sesion?.rut
  const [items, setItems] = useState<ItemCarrito[]>(() => leerCarrito(rut))

  useEffect(() => {
    setItems(leerCarrito(rut))
  }, [rut])

  const guardar = useCallback(
    (nuevos: ItemCarrito[]) => {
      setItems(nuevos)
      localStorage.setItem(claveCarrito(rut), JSON.stringify(nuevos))
    },
    [rut],
  )

  const agregar = useCallback(
    (producto: Producto, cantidad = 1) => {
      const existente = items.find((item) => item.sku === producto.sku)
      const tope = Math.max(producto.stockDisponible, 1)
      if (existente) {
        guardar(
          items.map((item) =>
            item.sku === producto.sku
              ? { ...item, cantidad: Math.min(item.cantidad + cantidad, tope), stockDisponible: producto.stockDisponible }
              : item,
          ),
        )
      } else {
        guardar([
          ...items,
          {
            sku: producto.sku,
            modelo: producto.modelo,
            marca: producto.marca,
            precio: producto.precio,
            imagenUrl: producto.imagenUrl,
            stockDisponible: producto.stockDisponible,
            cantidad: Math.min(cantidad, tope),
          },
        ])
      }
    },
    [items, guardar],
  )

  const cambiarCantidad = useCallback(
    (sku: string, cantidad: number) => {
      guardar(
        items.map((item) =>
          item.sku === sku
            ? { ...item, cantidad: Math.max(1, Math.min(cantidad, Math.max(item.stockDisponible, 1))) }
            : item,
        ),
      )
    },
    [items, guardar],
  )

  const quitar = useCallback((sku: string) => guardar(items.filter((item) => item.sku !== sku)), [items, guardar])

  const vaciar = useCallback(() => guardar([]), [guardar])

  const valor = useMemo<CarritoContextValue>(
    () => ({
      items,
      cantidadTotal: items.reduce((total, item) => total + item.cantidad, 0),
      subtotal: items.reduce((total, item) => total + item.precio * item.cantidad, 0),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
    }),
    [items, agregar, cambiarCantidad, quitar, vaciar],
  )

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export const useCarrito = (): CarritoContextValue => {
  const contexto = useContext(CarritoContext)
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  }
  return contexto
}
