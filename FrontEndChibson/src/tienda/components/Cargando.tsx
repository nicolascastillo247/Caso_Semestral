import { LoaderCircle } from 'lucide-react'

export const Cargando = ({ texto = 'Cargando...' }: { texto?: string }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-gris" role="status">
    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
    <span>{texto}</span>
  </div>
)

export default Cargando
