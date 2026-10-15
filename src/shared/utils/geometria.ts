import type { Rectangulo } from '../types/eventos';

/** Mismas claves que GSAP: se esparce directo en un `from()`. */
export interface DesplazamientoFlip {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

/**
 * FLIP: cuánto mover y escalar un elemento que ya está en `destino` para que parezca estar en
 * `origen` (centro sobre centro, misma altura). Animarlo desde ahí a 0 lo "hace viajar".
 */
export function calcularFlip(origen: Rectangulo, destino: Rectangulo): DesplazamientoFlip {
  return {
    x: origen.x + origen.ancho / 2 - (destino.x + destino.ancho / 2),
    y: origen.y + origen.alto / 2 - (destino.y + destino.alto / 2),
    scale: origen.alto / destino.alto,
  };
}
