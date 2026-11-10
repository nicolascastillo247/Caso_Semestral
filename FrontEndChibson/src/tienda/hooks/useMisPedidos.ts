import PedidoService from '../services/pedido.service'
import useApi from './useApi'

export const useMisPedidos = () => {
  const { datos, cargando, error, recargar } = useApi(() => PedidoService.misPedidos())
  const pedidos = [...(datos ?? [])].sort((a, b) => b.numeroPedido - a.numeroPedido)
  return { pedidos, cargando, error, recargar }
}

export default useMisPedidos
