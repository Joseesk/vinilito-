import { MathUtils, type PerspectiveCamera, Vector3 } from 'three';

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

interface VistaBase extends Vista {
  /** Ancho (m) que tiene que entrar siempre a la altura del punto de mira. */
  readonly anchoMinimo: number;
  /**
   * En pantallas verticales, cuánto se corre el objeto en el cuadro (fracción del alto
   * visible): positivo = más arriba (la ficha va abajo), negativo = más abajo (el cartel arriba).
   */
  readonly desplazamientoVertical: number;
  /**
   * En pantallas verticales, corrimiento lateral (m) de cámara y mira: en escritorio algunas
   * vistas miran de costado para dejar lugar a la ficha, que en vertical va abajo.
   */
  readonly corrimientoXVertical: number;
}

/** Repisa de frente, apenas desde arriba: la fila de discos ocupa ~2/3 del alto. */
const GENERAL: VistaBase = {
  posicion: { x: 0, y: 0.19, z: 0.82 },
  mira: { x: 0, y: 0.15, z: 0 },
  anchoMinimo: 0.5,
  desplazamientoVertical: -0.15,
  corrimientoXVertical: 0,
};

/** Más abajo y algo más atrás: se ve la funda en la mano y el tocadiscos debajo. */
const FUNDA: VistaBase = {
  posicion: { x: 0.05, y: -0.02, z: 1.05 },
  mira: { x: -0.04, y: -0.2, z: 0.2 },
  anchoMinimo: 0.5,
  desplazamientoVertical: 0.12,
  corrimientoXVertical: 0,
};

/**
 * Desde adelante y arriba del tocadiscos: el plato girando y el brazo apoyado. Mira algo a
 * la derecha del plato para que el tocadiscos quede a la izquierda de la ficha.
 */
const TOCADISCOS: VistaBase = {
  posicion: { x: 0.2, y: -0.12, z: 0.74 },
  mira: { x: 0.13, y: -0.42, z: 0.06 },
  anchoMinimo: 0.55,
  desplazamientoVertical: 0.12,
  corrimientoXVertical: -0.17,
};

/** Mitad del campo vertical de la cámara (35°, ver `renderizador.ts`). */
const MITAD_FOV = MathUtils.degToRad(35 / 2);

/**
 * Adapta una vista a la proporción de la pantalla: si el ancho mínimo no entra (celular en
 * vertical) aleja la cámara en la misma dirección, y en vertical corre el objeto en el cuadro.
 */
function adaptar(base: VistaBase, aspecto: number): Vista {
  const mira = new Vector3(base.mira.x, base.mira.y, base.mira.z);
  const direccion = new Vector3(base.posicion.x, base.posicion.y, base.posicion.z).sub(mira);
  const distanciaNecesaria = base.anchoMinimo / 2 / (Math.tan(MITAD_FOV) * aspecto);
  const distancia = Math.max(direccion.length(), distanciaNecesaria);
  const posicion = mira.clone().add(direccion.setLength(distancia));
  if (aspecto < 1) {
    mira.y -= base.desplazamientoVertical * 2 * distancia * Math.tan(MITAD_FOV);
    mira.x += base.corrimientoXVertical;
    posicion.x += base.corrimientoXVertical;
  }
  return { posicion, mira };
}

export interface Vistas {
  readonly general: Vista;
  readonly funda: Vista;
  readonly tocadiscos: Vista;
}

/** Las tres vistas del estudio para la proporción actual (se calculan al animar). */
export function obtenerVistas(aspecto: number): Vistas {
  return {
    general: adaptar(GENERAL, aspecto),
    funda: adaptar(FUNDA, aspecto),
    tocadiscos: adaptar(TOCADISCOS, aspecto),
  };
}

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
  const { x, y, z } = hasta.posicion;
  linea.to(camara.position, { x, y, z, duration: duracion }, inicio);
  linea.to(
    mira,
    {
      x: hasta.mira.x,
      y: hasta.mira.y,
      z: hasta.mira.z,
      duration: duracion,
      onUpdate: () => camara.lookAt(mira),
    },
    inicio,
  );
}
