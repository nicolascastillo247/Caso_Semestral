import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import type { Producto } from '../services/producto.service'

export const useComprar = () => {
  const { estaAutenticado, esCliente } = useAuth()
  const { agregar } = useCarrito()
  const navigate = useNavigate()
  const [redireccionLogin, setRedireccionLogin] = useState<string | null>(null)

  const comprar = (producto: Producto, cantidad = 1) => {
    if (!estaAutenticado || !esCliente) {
      setRedireccionLogin(`/productos/${encodeURIComponent(producto.sku)}`)
      return
    }
    agregar(producto, cantidad)
    navigate('/carrito')
  }

  return {
    comprar,
    modalVisible: redireccionLogin !== null,
    redireccionLogin: redireccionLogin ?? '/',
    cerrarModal: () => setRedireccionLogin(null),
  }
}

export default useComprar
