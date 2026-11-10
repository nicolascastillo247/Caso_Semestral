import { insignia } from '../utils/estilos'

interface InsigniaProps {
  valor: string
  estados: Record<string, { texto: string; color: string }>
}

export const Insignia = ({ valor, estados }: InsigniaProps) => {
  const estado = estados[valor] ?? { texto: valor, color: 'bg-zinc-500 text-white' }
  return <span className={`${insignia} ${estado.color}`}>{estado.texto}</span>
}

export default Insignia
