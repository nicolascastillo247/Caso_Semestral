import type { InputHTMLAttributes, ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { ayuda as claseAyuda, campo, campoConError, etiqueta as claseEtiqueta } from '../utils/estilos'

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  ayuda?: ReactNode
  // Si viene, el campo se marca en rojo y el mensaje aparece debajo (sobre la ayuda)
  error?: string
}

export const CampoTexto = ({ etiqueta, ayuda, error, id, className, ...props }: CampoTextoProps) => {
  const idMensaje = `${id}-mensaje`
  return (
    <div className={className ?? 'mb-4'}>
      <label htmlFor={id} className={`${claseEtiqueta} ${error ? 'text-red-700' : ''}`}>
        {etiqueta}
      </label>
      <input
        id={id}
        className={error ? campoConError : campo}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? `${idMensaje}-error` : '', ayuda ? idMensaje : ''].join(' ').trim() || undefined}
        {...props}
      />
      {error && (
        <p id={`${idMensaje}-error`} className="mt-1 mb-0 flex items-center gap-1 text-xs font-medium text-red-700" role="alert">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {ayuda && (
        <div id={idMensaje} className={claseAyuda}>
          {ayuda}
        </div>
      )}
    </div>
  )
}

export default CampoTexto
