import {
  DURACION_INTRO,
  EASE_CAIDA,
  EASE_ENTRADA,
  STAGGER_LOMOS,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import { obtenerElemento } from '../../shared/utils';
import { PROPIEDADES_ANIMADAS } from './constantes';
import { obtenerLomos } from './lomos';

const ALTURA_CAIDA_PORCENTAJE = -60;
const GIRO_INICIAL_CARTEL = -10;
const SUBIDA_CARTEL_PORCENTAJE = -40;
/** La tabla aparece en media intro y los discos empiezan a caer antes de que termine. */
const DURACION_TABLA = DURACION_INTRO / 2;
const INICIO_LOMOS = DURACION_TABLA * 0.7;
/**
 * Tope del escalonamiento total: con 5 discos da `STAGGER_LOMOS` entre cada uno y con
 * 10 se reparte más apretado, así la intro sigue bajo los 2 s.
 */
const ESCALONAMIENTO_TOTAL = STAGGER_LOMOS * 4;

interface PiezasIntro {
  readonly tabla: HTMLElement;
  readonly lomos: readonly HTMLElement[];
  readonly cartel: HTMLElement;
}

function obtenerPiezas(escena: HTMLElement): PiezasIntro {
  return {
    tabla: obtenerElemento('.repisa__tabla', escena),
    lomos: obtenerLomos(escena),
    cartel: obtenerElemento('.cartel', escena),
  };
}

function crearIntroCompleta({ tabla, lomos, cartel }: PiezasIntro): gsap.core.Timeline {
  const linea = gsap.timeline({
    defaults: { duration: DURACION_INTRO, ease: EASE_ENTRADA, clearProps: PROPIEDADES_ANIMADAS },
  });
  linea.from(tabla, { scaleX: 0, duration: DURACION_TABLA }, 0);
  linea.from(
    lomos,
    {
      yPercent: ALTURA_CAIDA_PORCENTAJE,
      autoAlpha: 0,
      ease: EASE_CAIDA,
      stagger: { amount: ESCALONAMIENTO_TOTAL },
    },
    INICIO_LOMOS,
  );
  linea.from(
    cartel,
    { yPercent: SUBIDA_CARTEL_PORCENTAJE, rotation: GIRO_INICIAL_CARTEL, autoAlpha: 0 },
    0,
  );
  return linea;
}

function crearIntroReducida({ tabla, lomos, cartel }: PiezasIntro): gsap.core.Timeline {
  return gsap.timeline().from([tabla, ...lomos, cartel], {
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
  return prefiereMenosMovimiento() ? crearIntroReducida(piezas) : crearIntroCompleta(piezas);
}
