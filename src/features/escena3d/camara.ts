import { type PerspectiveCamera, Vector3 } from 'three';

interface Punto {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Vista {
  readonly posicion: Punto;
  /** Punto al que mira la cámara. */
  readonly mira: Punto;
}

/** Repisa de frente, apenas desde arriba: la fila de discos ocupa ~2/3 del alto. */
export const VISTA_GENERAL: Vista = {
  posicion: { x: 0, y: 0.19, z: 0.82 },
  mira: { x: 0, y: 0.15, z: 0 },
};

/** Más abajo y algo más atrás: se ve la funda en la mano y el tocadiscos debajo. */
export const VISTA_FUNDA: Vista = {
  posicion: { x: 0.05, y: -0.02, z: 1.05 },
  mira: { x: -0.04, y: -0.2, z: 0.2 },
};

export function ubicarCamara(camara: PerspectiveCamera, { posicion, mira }: Vista): void {
  camara.position.set(posicion.x, posicion.y, posicion.z);
  camara.lookAt(mira.x, mira.y, mira.z);
}

export interface ViajeCamara {
  readonly camara: PerspectiveCamera;
  readonly desde: Vista;
  readonly hasta: Vista;
  readonly duracion: number;
}

/**
 * Agrega al timeline el viaje de la cámara entre dos vistas. Posición y punto de mira se
 * animan juntos (el mira con `lookAt` en cada cuadro); es reversible como el timeline.
 */
export function agregarViajeCamara(
  linea: gsap.core.Timeline,
  { camara, desde, hasta, duracion }: ViajeCamara,
  inicio: number,
): void {
  const mira = new Vector3(desde.mira.x, desde.mira.y, desde.mira.z);
  linea.to(camara.position, { ...hasta.posicion, duration: duracion }, inicio);
  linea.to(
    mira,
    { ...hasta.mira, duration: duracion, onUpdate: () => camara.lookAt(mira) },
    inicio,
  );
}
