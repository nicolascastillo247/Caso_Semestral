import { Link } from 'react-router'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog'
import { botonContorno, botonDorado } from '../utils/estilos'

interface ModalLoginRequeridoProps {
  visible: boolean
  redireccion: string
  alCerrar: () => void
}

// Modal de shadcn en vez del modal de Bootstrap
export const ModalLoginRequerido = ({ visible, redireccion, alCerrar }: ModalLoginRequeridoProps) => (
  <Dialog open={visible} onOpenChange={(abierto: boolean) => { if (!abierto) alCerrar() }}>
    <DialogContent className="tienda sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Iniciar sesión requerido</DialogTitle>
        <DialogDescription>
          Para comprar este producto o agregarlo a tu carro, necesitas tener una cuenta activa e iniciar sesión.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col gap-2 sm:flex-row">
        <Link to={`/login?redirect=${encodeURIComponent(redireccion)}`} className={`${botonDorado} flex-1`}>
          Iniciar sesión
        </Link>
        <Link to="/registro" className={`${botonContorno} flex-1`}>
          Registrarse
        </Link>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default ModalLoginRequerido
