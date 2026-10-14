/**
 * Números pseudoaleatorios en [0, 1) a partir de una semilla (algoritmo mulberry32).
 * Determinista: las texturas generadas por código salen iguales en cada visita.
 * Las constantes son las del algoritmo publicado, no valores a ajustar.
 */
export function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let mezcla = Math.imul(estado ^ (estado >>> 15), estado | 1);
    mezcla ^= mezcla + Math.imul(mezcla ^ (mezcla >>> 7), mezcla | 61);
    return ((mezcla ^ (mezcla >>> 14)) >>> 0) / 4294967296;
  };
}

/** Valor aleatorio entre `minimo` y `maximo` usando un generador ya creado. */
export function entre(azar: () => number, minimo: number, maximo: number): number {
  return minimo + azar() * (maximo - minimo);
}
