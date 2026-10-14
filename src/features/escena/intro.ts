import {
  DURACION_INTRO,
  EASE_ENTRADA,
  STAGGER_LOMOS,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import { obtenerElemento } from '../../shared/utils';
import { PROPIEDADES_ANIMADAS, SELECTOR_CARAS } from './constantes';

const SUBIDA_LOMOS_PORCENTAJE = 40;
const ESCALA_INICIAL_NUMERO = 0.6;
const ENTRADA_LOSA_PORCENTAJE = -130;
/** Los números arrancan a mitad de la subida para que la intro quede bajo los 2 s. */
const INICIO_NUMEROS = DURACION_INTRO / 2;

interface PiezasIntro {
  readonly lomos: NodeListOf<HTMLElement>;
  readonly numeros: NodeListOf<HTMLElement>;
  readonly losa: HTMLElement;
}

function obtenerPiezas(escena: HTMLElement): PiezasIntro {
  return {
    lomos: escena.querySelectorAll<HTMLElement>('.lomo'),
    numeros: escena.querySelectorAll<HTMLElement>('.lomo__numero'),
    losa: obtenerElemento('.losa', escena),
  };
}

function agregarSubidaLomos(linea: gsap.core.Timeline, lomos: NodeListOf<HTMLElement>): void {
  lomos.forEach((lomo, indice) => {
    const inicio = indice * STAGGER_LOMOS;
    linea.from(
      lomo,
      { yPercent: SUBIDA_LOMOS_PORCENTAJE, clearProps: PROPIEDADES_ANIMADAS },
      inicio,
    );
    linea.from(
      lomo.querySelectorAll(SELECTOR_CARAS),
      { autoAlpha: 0, clearProps: PROPIEDADES_ANIMADAS },
      inicio,
    );
  });
}

function crearIntroCompleta({ lomos, numeros, losa }: PiezasIntro): gsap.core.Timeline {
  const linea = gsap.timeline({ defaults: { duration: DURACION_INTRO, ease: EASE_ENTRADA } });
  agregarSubidaLomos(linea, lomos);
  linea.from(
    numeros,
    {
      scale: ESCALA_INICIAL_NUMERO,
      autoAlpha: 0,
      stagger: STAGGER_LOMOS,
      clearProps: PROPIEDADES_ANIMADAS,
    },
    INICIO_NUMEROS,
  );
  linea.from(
    losa,
    { xPercent: ENTRADA_LOSA_PORCENTAJE, autoAlpha: 0, clearProps: PROPIEDADES_ANIMADAS },
    0,
  );
  return linea;
}

function crearIntroReducida({ losa }: PiezasIntro, escena: HTMLElement): gsap.core.Timeline {
  const piezas = [...escena.querySelectorAll<HTMLElement>(SELECTOR_CARAS), losa];
  return gsap.timeline().from(piezas, {
    autoAlpha: 0,
    duration: DURACION_INTRO,
    ease: EASE_ENTRADA,
    clearProps: PROPIEDADES_ANIMADAS,
  });
}

/**
 * Llamar justo después de montar la escena y en la misma tarea: los `from()` aplican
 * el estado inicial al instante, antes del primer paint, así no hay parpadeo.
 */
export function animarIntro(escena: HTMLElement): gsap.core.Timeline {
  const piezas = obtenerPiezas(escena);
  return prefiereMenosMovimiento()
    ? crearIntroReducida(piezas, escena)
    : crearIntroCompleta(piezas);
}
