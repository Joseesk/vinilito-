import {
  DURACION_INTRO,
  EASE_ENTRADA,
  STAGGER_LOMOS,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import type { LucesEstudio } from './crearEstudio';
import type { FundaEnRepisa } from './ubicarFundas';

/** Una lámpara que se prende: sube, titila una vez y se estabiliza. Fracciones del total. */
const PARPADEO_SPOT = [0, 0.75, 0.35, 1] as const;
const DURACION_ENCENDIDO = DURACION_INTRO * 0.7;
/** Las fundas entran desde adelante hasta su lugar, como al acomodar discos en la repisa. */
const RECORRIDO_FUNDA = 0.08;
const INICIO_FUNDAS = DURACION_ENCENDIDO * 0.5;
/** Mismo tope que la intro CSS: con 10 fundas el escalonamiento se aprieta y sigue < 2 s. */
const ESCALONAMIENTO_TOTAL = STAGGER_LOMOS * 4;

export interface PiezasIntro3d {
  readonly luces: LucesEstudio;
  readonly fundas: readonly FundaEnRepisa[];
  readonly solicitarRender: () => void;
}

function encenderLuces(linea: gsap.core.Timeline, { spot, ambiente }: LucesEstudio): void {
  const intensidad = spot.intensity;
  // Apagada ya (antes del primer cuadro): los keyframes parten de este 0
  spot.intensity = 0;
  linea.to(
    spot,
    {
      keyframes: { intensity: PARPADEO_SPOT.slice(1).map((fraccion) => fraccion * intensidad) },
      duration: DURACION_ENCENDIDO,
      ease: 'none',
    },
    0,
  );
  linea.from(ambiente, { intensity: 0, duration: DURACION_ENCENDIDO, ease: EASE_ENTRADA }, 0);
}

/** La luz se prende y las fundas se acomodan. Con movimiento reducido solo se prende la luz. */
export function animarIntro3d({
  luces,
  fundas,
  solicitarRender,
}: PiezasIntro3d): gsap.core.Timeline {
  const linea = gsap.timeline({ onUpdate: solicitarRender });
  encenderLuces(linea, luces);
  if (prefiereMenosMovimiento()) {
    return linea;
  }
  linea.from(
    fundas.map((funda) => funda.pivote.position),
    {
      z: `+=${RECORRIDO_FUNDA}`,
      duration: DURACION_INTRO * 0.7,
      ease: EASE_ENTRADA,
      stagger: { amount: ESCALONAMIENTO_TOTAL },
    },
    INICIO_FUNDAS,
  );
  return linea;
}
