import { useRef, useState, type ChangeEvent } from 'react';
import { ImageIcon, ImageOff, Upload, X } from 'lucide-react';

import { TAMANO_MAXIMO_IMAGEN, TIPOS_IMAGEN, type ImagenSubida } from '../../services/imagen.service';
import { mensajeError } from '../../utils/errores';
import { urlImagen } from '../../tienda/utils/formato';
import { Button } from '../../components/ui/button';

// Botón "Elegir imagen" con vista previa. Lo usan los modales de producto y de noticia.
// Al elegir un archivo se sube de inmediato al backend, que lo guarda en su carpeta de imágenes
// y responde con el nombre del archivo; el modal guarda ese nombre al crear o modificar.

interface SelectorImagenProps {
  etiqueta: string;
  imagenUrl: string | null; // dirección para la vista previa (la que entrega el backend)
  subir: (archivo: File) => Promise<ImagenSubida>;
  onCambio: (imagen: ImagenSubida | null) => void;
  onSubiendo?: (subiendo: boolean) => void;
  opcional?: boolean; // muestra "Quitar imagen" (las noticias pueden no tener imagen)
  deshabilitado?: boolean;
}

export const SelectorImagen = ({
  etiqueta, imagenUrl, subir, onCambio, onSubiendo, opcional = false, deshabilitado = false,
}: SelectorImagenProps) => {
  const selectorArchivo = useRef<HTMLInputElement>(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [rota, setRota] = useState(false);
  const [error, setError] = useState('');

  const cambiarSubiendo = (valor: boolean) => {
    setSubiendo(valor);
    onSubiendo?.(valor);
  };

  const elegirArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = ''; // así se puede volver a elegir el mismo archivo
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setError('La imagen debe ser PNG, JPG, WEBP o GIF.');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setError('La imagen no puede pesar más de 5 MB.');
      return;
    }
    setError('');
    cambiarSubiendo(true);
    try {
      onCambio(await subir(archivo));
      setNombreArchivo(archivo.name);
      setRota(false);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo subir la imagen.'));
    } finally {
      cambiarSubiendo(false);
    }
  };

  const quitar = () => {
    onCambio(null);
    setNombreArchivo('');
    setError('');
  };

  const tieneImagen = Boolean(imagenUrl);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span>{etiqueta}</span>
      <div className="flex items-center gap-4">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
          {!tieneImagen ? (
            <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          ) : rota ? (
            <ImageOff className="size-8 text-muted-foreground" aria-label="No se pudo cargar la imagen" />
          ) : (
            <img src={urlImagen(imagenUrl)} alt="Vista previa" className="size-full object-contain" onError={() => setRota(true)} />
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <input
            ref={selectorArchivo}
            type="file"
            accept={TIPOS_IMAGEN.join(',')}
            className="hidden"
            onChange={(e) => void elegirArchivo(e)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => selectorArchivo.current?.click()}
              disabled={subiendo || deshabilitado}
            >
              <Upload /> {subiendo ? 'Subiendo...' : tieneImagen ? 'Cambiar imagen' : 'Elegir imagen'}
            </Button>
            {opcional && tieneImagen && (
              <Button type="button" variant="ghost" onClick={quitar} disabled={subiendo || deshabilitado}>
                <X /> Quitar
              </Button>
            )}
          </div>
          <span className="max-w-full truncate text-xs text-muted-foreground">
            {nombreArchivo || (tieneImagen ? 'Imagen actual.' : 'PNG, JPG, WEBP o GIF, hasta 5 MB.')}
          </span>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default SelectorImagen;
