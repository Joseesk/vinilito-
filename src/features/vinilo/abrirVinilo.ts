import {
  DURACION_APERTURA,
  DURACION_FUNDA,
  DURACION_VUELTA_DISCO,
  EASE_GIRO,
  EASE_VINILO,
  esMovil,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import type { Rectangulo } from '../../shared/types/eventos';
import { calcularFlip, medirElemento, obtenerElemento } from '../../shared/utils';

/** La funda arranca casi de canto: a 80° y a escala del lomo se ve tan angosta como él. */
const GIRO_FUNDA_CANTO = 80;
/** Cuánto asoma el disco fuera de la funda (escritorio: a la derecha; móvil: hacia abajo). */
const SALIDA_DISCO_PORCENTAJE = 55;
const DURACION_SALIDA_DISCO = DURACION_APERTURA - DURACION_FUNDA;
/** Fundido corto: la funda tiene que verse sólida mientras gira de canto a frente. */
const DURACION_APARICION = DURACION_FUNDA / 4;
const VUELTA_COMPLETA = 360;

export interface PiezasApertura {
  readonly escenario: HTMLElement;
  readonly conjunto: HTMLElement;
  readonly origen: Rectangulo;
}

export interface AvisosApertura {
  readonly alAbrir: () => void;
  readonly alCerrar: () => void;
}

/** FLIP: lleva la funda (ya en su lugar final) al rectángulo del lomo clickeado. */
function calcularDesdeOrigen(funda: HTMLElement, origen: Rectangulo): gsap.TweenVars {
  return { ...calcularFlip(origen, medirElemento(funda)), rotationY: GIRO_FUNDA_CANTO };
}

function obtenerSalidaDisco(): gsap.TweenVars {
  return esMovil() ? { yPercent: SALIDA_DISCO_PORCENTAJE } : { xPercent: SALIDA_DISCO_PORCENTAJE };
}

/** Abrir = `play()`, cerrar = `reverse()` del mismo timeline. Se crea pausado. */
export function crearApertura(piezas: PiezasApertura, avisos: AvisosApertura): gsap.core.Timeline {
  const { escenario, conjunto, origen } = piezas;
  const funda = obtenerElemento('.funda', conjunto);
  const disco = obtenerElemento('.vinilo', conjunto);
  const linea = gsap.timeline({
    paused: true,
    defaults: { ease: EASE_VINILO },
    onComplete: avisos.alAbrir,
    onReverseComplete: avisos.alCerrar,
  });
  if (prefiereMenosMovimiento()) {
    linea.set(disco, obtenerSalidaDisco(), 0);
    linea.to(disco, { autoAlpha: 1, duration: DURACION_APERTURA }, 0);
    return linea.to(escenario, { autoAlpha: 1, duration: DURACION_APERTURA }, 0);
  }
  linea.to(escenario, { autoAlpha: 1, duration: DURACION_APARICION, ease: 'none' }, 0);
  linea.from(funda, { ...calcularDesdeOrigen(funda, origen), duration: DURACION_FUNDA }, 0);
  // El disco arranca oculto por CSS y aparece cuando la funda llegó: si no, se vería
  // quieto en el destino mientras la funda vuela
  linea.to(disco, { autoAlpha: 1, duration: 0 }, DURACION_FUNDA);
  linea.to(disco, { ...obtenerSalidaDisco(), duration: DURACION_SALIDA_DISCO }, DURACION_FUNDA);
  return linea;
}

/**
 * El giro va en un tween aparte: con `repeat: -1` dentro del timeline de apertura,
 * este duraría infinito y `reverse()` nunca volvería al inicio.
 */
export function iniciarGiro(conjunto: HTMLElement): gsap.core.Tween | null {
  if (prefiereMenosMovimiento()) {
    return null;
  }
  return gsap.to(obtenerElemento('.vinilo__disco', conjunto), {
    rotation: VUELTA_COMPLETA,
    duration: DURACION_VUELTA_DISCO,
    ease: EASE_GIRO,
    repeat: -1,
  });
}
