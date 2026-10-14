/**
 * La opacidad va en las caras y no en el lomo: `opacity < 1` en un padre con
 * `preserve-3d` aplana el 3D y la cara lateral desaparece.
 */
export const SELECTOR_CARAS = '.lomo__frente, .lomo__lado';

/** Al terminar se devuelve el control al CSS (si no, el inline pisa reglas futuras). */
export const PROPIEDADES_ANIMADAS = 'transform,opacity,visibility';
