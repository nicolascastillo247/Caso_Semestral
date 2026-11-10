import type { InputHTMLAttributes } from 'react'
import { ayuda as claseAyuda, campo, etiqueta as claseEtiqueta } from '../utils/estilos'

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  ayuda?: string
}

export const CampoTexto = ({ etiqueta, ayuda, id, className, ...props }: CampoTextoProps) => (
  <div className={className ?? 'mb-4'}>
    <label htmlFor={id} className={claseEtiqueta}>
      {etiqueta}
    </label>
    <input id={id} className={campo} {...props} />
    {ayuda && <p className={claseAyuda}>{ayuda}</p>}
  </div>
)

export default CampoTexto
