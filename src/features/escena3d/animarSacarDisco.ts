import type { PerspectiveCamera } from 'three';
import { EASE_VINILO, gsap } from '../../shared/animacion';
import { agregarViajeCamara, obtenerVistas } from './camara';
import type { FundaEnRepisa } from './ubicarFundas';

/** El dedo engancha el borde superior: la funda se inclina sobre su canto frontal. */
const ENGANCHE = (16 * Math.PI) / 180;
/** Sale de la fila hacia adelante y arriba antes de girar (si no, atravesaría a las vecinas). */
const SALIDA = { subida: 0.08, adelante: 0.2 } as const;
/**
 * Donde queda "en la mano": centro inferior de la portada (tras el giro el pivote queda ahí),
 * delante de la repisa y por encima del tocadiscos.
 */
export const PRESENTACION = { x: -0.13, y: -0.27, z: 0.32 } as const;
/** Gira para mostrar la portada (cara +x) a la cámara. */
const GIRO_PORTADA = -Math.PI / 2;
const TIEMPOS = {
  enganche: { inicio: 0, duracion: 0.35 },
  salida: { inicio: 0.25, duracion: 0.45 },
  presentacion: { inicio: 0.65, duracion: 0.75 },
  camara: { inicio: 0.3, duracion: 1.1 },
} as const;
/** Cuando la funda ya está en la mano mostrando la portada: ahí sigue el disco (Y9). */
export const FIN_SACAR_FUNDA = TIEMPOS.presentacion.inicio + TIEMPOS.presentacion.duracion;

export interface PiezasSacarFunda {
  readonly funda: FundaEnRepisa;
  readonly camara: PerspectiveCamera;
  readonly solicitarRender: () => void;
}

/** 1 y 2: engancharla con el dedo y sacarla de la fila hacia adelante y arriba. */
function agregarSalidaDeFila(
  linea: gsap.core.Timeline,
  { pivote, inclinador }: FundaEnRepisa,
): void {
  const { enganche, salida } = TIEMPOS;
  linea.to(inclinador.rotation, { x: ENGANCHE, duration: enganche.duracion }, enganche.inicio);
  linea.to(
    pivote.position,
    { y: `+=${SALIDA.subida}`, z: `+=${SALIDA.adelante}`, duration: salida.duracion },
    salida.inicio,
  );
  // Al salir se endereza (también la última, que estaba apoyada en su vecina)
  linea.to(inclinador.rotation, { x: 0, duration: salida.duracion }, salida.inicio + 0.2);
  linea.to(pivote.rotation, { z: 0, duration: salida.duracion }, salida.inicio);
}

/** 3: la gira para ver la portada y la sostiene delante, sobre el tocadiscos. */
function agregarPresentacion(linea: gsap.core.Timeline, { pivote }: FundaEnRepisa): void {
  const { inicio, duracion } = TIEMPOS.presentacion;
  linea.to(pivote.position, { ...PRESENTACION, duration: duracion }, inicio);
  linea.to(pivote.rotation, { y: GIRO_PORTADA, duration: duracion }, inicio);
}

/**
 * Sacar la funda de la repisa, como en la vida real: engancharla, sacarla de la fila y
 * girarla para ver la portada mientras la cámara acompaña. Pausado y reversible.
 */
export function crearSacarFunda({
  funda,
  camara,
  solicitarRender,
}: PiezasSacarFunda): gsap.core.Timeline {
  const linea = gsap.timeline({
    paused: true,
    defaults: { ease: EASE_VINILO },
    onUpdate: solicitarRender,
  });
  // Vistas adaptadas a la pantalla actual (en un celular vertical la cámara se aleja)
  const vistas = obtenerVistas(camara.aspect);
  agregarSalidaDeFila(linea, funda);
  agregarPresentacion(linea, funda);
  agregarViajeCamara(
    linea,
    { camara, desde: vistas.general, hasta: vistas.funda, duracion: TIEMPOS.camara.duracion },
    TIEMPOS.camara.inicio,
  );
  return linea;
}
