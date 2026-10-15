// Duraciones en segundos (unidad de GSAP)
export const DURACION_INTRO = 0.9;
export const DURACION_APERTURA = 1;
/** Primera parte de la apertura: el lomo se va y la funda gira hasta quedar de frente. */
export const DURACION_FUNDA = DURACION_APERTURA * 0.55;
export const DURACION_FICHA = 0.5;
export const RETRASO_FICHA = 0.3;
/** Una vuelta a 33⅓ rpm, como un vinilo real. */
export const DURACION_VUELTA_DISCO = 1.8;

/** Con 5 lomos la intro completa queda bajo los 2 s. */
export const STAGGER_LOMOS = 0.12;

export const EASE_ENTRADA = 'power3.out';
export const EASE_VINILO = 'power2.inOut';
/** Los discos caen sobre la repisa y rebotan apenas, como un objeto con peso. */
export const EASE_CAIDA = 'back.out(1.6)';
/** El giro continuo necesita velocidad constante o se notan tirones en cada vuelta. */
export const EASE_GIRO = 'none';

const MEDIA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)';
/** Debe coincidir con el `@media (max-width: 767px)` de los CSS de cada feature. */
export const MEDIA_MOVIL = '(max-width: 767px)';

function coincideMedia(consulta: string): boolean {
  return window.matchMedia(consulta).matches;
}

export function prefiereMenosMovimiento(): boolean {
  return coincideMedia(MEDIA_MOVIMIENTO_REDUCIDO);
}

export function esMovil(): boolean {
  return coincideMedia(MEDIA_MOVIL);
}
