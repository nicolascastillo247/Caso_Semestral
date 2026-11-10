import { aviso, boton } from '../utils/estilos'

interface MensajeErrorProps {
  mensaje: string | null
  alReintentar?: () => void
}

export const MensajeError = ({ mensaje, alReintentar }: MensajeErrorProps) => {
  if (!mensaje) return null
  return (
    <div className={`${aviso.error} flex flex-wrap items-center justify-between gap-2`} role="alert">
      <span>{mensaje}</span>
      {alReintentar && (
        <button type="button" className={boton('peligro', 'chico')} onClick={alReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export default MensajeError
