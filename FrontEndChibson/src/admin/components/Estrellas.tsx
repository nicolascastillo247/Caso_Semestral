import { Star } from 'lucide-react';

// Muestra una calificación de 1 a 5 con estrellas
export const Estrellas = ({ valor, tamano = 'size-4' }: { valor: number; tamano?: string }) => (
  <span className="inline-flex items-center gap-0.5" title={`${valor} de 5`} aria-label={`${valor} de 5 estrellas`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${tamano} ${i < valor ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
    ))}
  </span>
);

export default Estrellas;
