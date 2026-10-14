// Duraciones en segundos (unidad de GSAP)
export const DURACION_INTRO = 0.9;
export const DURACION_APERTURA = 1;
export const DURACION_FICHA = 0.5;
export const RETRASO_FICHA = 0.3;
/** Una vuelta a 33⅓ rpm, como un vinilo real. */
export const DURACION_VUELTA_DISCO = 1.8;

/** Con 5 lomos la intro completa queda bajo los 2 s del criterio del Sprint 5. */
export const STAGGER_LOMOS = 0.12;

export const EASE_ENTRADA = 'power3.out';
export const EASE_VINILO = 'power2.inOut';
/** El giro continuo necesita velocidad constante o se notan tirones en cada vuelta. */
export const EASE_GIRO = 'none';

export const MEDIA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)';

export function prefiereMenosMovimiento(): boolean {
  return window.matchMedia(MEDIA_MOVIMIENTO_REDUCIDO).matches;
}
