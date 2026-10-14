import {
  DURACION_APERTURA,
  DURACION_VUELTA_DISCO,
  EASE_GIRO,
  EASE_VINILO,
  gsap,
} from '../../shared/animacion';
import { obtenerElemento } from '../../shared/utils';

const SALIDA_DISCO_PORCENTAJE = 60;
const ESCALA_INICIAL_DISCO = 0.6;
const VUELTA_COMPLETA = 360;

export interface AvisosApertura {
  readonly alAbrir: () => void;
  readonly alCerrar: () => void;
}

/** Abrir = `play()`, cerrar = `reverse()` del mismo timeline. Se crea pausado. */
export function crearApertura(
  escenario: HTMLElement,
  vinilo: HTMLElement,
  avisos: AvisosApertura,
): gsap.core.Timeline {
  const linea = gsap.timeline({
    paused: true,
    defaults: { duration: DURACION_APERTURA, ease: EASE_VINILO },
    onComplete: avisos.alAbrir,
    onReverseComplete: avisos.alCerrar,
  });
  linea.to(escenario, { autoAlpha: 1 }, 0);
  linea.from(vinilo, { yPercent: SALIDA_DISCO_PORCENTAJE, scale: ESCALA_INICIAL_DISCO }, 0);
  return linea;
}

/**
 * El giro va en un tween aparte: con `repeat: -1` dentro del timeline de apertura,
 * este duraría infinito y `reverse()` nunca volvería al inicio.
 */
export function iniciarGiro(vinilo: HTMLElement): gsap.core.Tween {
  return gsap.to(obtenerElemento('.vinilo__disco', vinilo), {
    rotation: VUELTA_COMPLETA,
    duration: DURACION_VUELTA_DISCO,
    ease: EASE_GIRO,
    repeat: -1,
  });
}
