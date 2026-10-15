import { type Mesh, type PerspectiveCamera, Vector3 } from 'three';
import { DURACION_VUELTA_DISCO, EASE_GIRO, gsap } from '../../shared/animacion';
import { agregarViajeCamara, obtenerVistas } from './camara';
import { MEDIDAS_DISCO } from './crearDisco3d';
import { MEDIDAS_FUNDA } from './crearFunda3d';
import type { Tocadiscos } from './crearTocadiscos';
import { FIN_SACAR_FUNDA, PRESENTACION } from './animarSacarDisco';
import type { FundaEnRepisa } from './ubicarFundas';

/** Tiempos relativos al final de "sacar la funda" (la funda ya está en la mano). */
const T = {
  interna: { inicio: 0, duracion: 0.4 },
  disco: { inicio: 0.3, duracion: 0.45 },
  aUnLado: { inicio: 0.7, duracion: 0.5 },
  viaje: { inicio: 0.7, duracion: 0.6 },
  bajada: { inicio: 1.3, duracion: 0.2 },
  brazo: { inicio: 1.35, duracion: 0.4 },
  aguja: { inicio: 1.75, duracion: 0.15 },
} as const;
/** Por el lado abierto (a la derecha con la portada de frente): interna y disco salen hacia +x. */
const SALIDA_INTERNA = 0.17;
const SALIDA_DISCO = 0.36;
/** La funda se deja a un lado (izquierda), girada, para no tapar el plato. */
const A_UN_LADO = { x: -0.42, giroY: -1.15 } as const;
const ALTURA_SOBRE_PLATO = 0.03;
const BRAZO = { giro: -0.42, alzado: -0.05, apoyado: 0.015 } as const;

export interface PiezasDisco {
  readonly funda: FundaEnRepisa;
  readonly interna: Mesh;
  readonly disco: Mesh;
  readonly tocadiscos: Tocadiscos;
  readonly camara: PerspectiveCamera;
  readonly solicitarRender: () => void;
}

const enT = (inicio: number): number => FIN_SACAR_FUNDA + inicio;

/** El disco arranca dentro de la funda (centro de la funda ya presentada), de frente. */
function ubicarDiscoAdentro({ disco, funda }: PiezasDisco): void {
  const espesor = funda.malla.geometry.parameters.width;
  disco.position.set(
    PRESENTACION.x,
    PRESENTACION.y + MEDIDAS_FUNDA.lado / 2,
    PRESENTACION.z + espesor / 2,
  );
  disco.rotation.set(Math.PI / 2, 0, 0);
  disco.visible = false;
}

/** Funda interna (hacia −z local de la funda = +x en pantalla) y el disco por su lado abierto. */
function agregarSalidaDelSobre(linea: gsap.core.Timeline, piezas: PiezasDisco): void {
  const { interna, disco, funda } = piezas;
  linea.set(disco, { visible: true }, enT(0));
  linea.to(
    interna.position,
    { z: -SALIDA_INTERNA, duration: T.interna.duracion },
    enT(T.interna.inicio),
  );
  linea.to(
    disco.position,
    { x: `+=${SALIDA_INTERNA}`, duration: T.interna.duracion },
    enT(T.interna.inicio),
  );
  linea.to(
    disco.position,
    { x: `+=${SALIDA_DISCO - SALIDA_INTERNA}`, duration: T.disco.duracion },
    enT(T.disco.inicio),
  );
  linea.to(
    funda.pivote.position,
    { x: A_UN_LADO.x, duration: T.aUnLado.duracion },
    enT(T.aUnLado.inicio),
  );
  linea.to(
    funda.pivote.rotation,
    { y: A_UN_LADO.giroY, duration: T.aUnLado.duracion },
    enT(T.aUnLado.inicio),
  );
}

/** Centro del disco ya apoyado sobre el fieltro, en coordenadas del mundo. */
function calcularApoyo({ grupo, centroPlato, alturaApoyo }: Tocadiscos): Vector3 {
  return grupo.localToWorld(
    new Vector3(centroPlato.x, alturaApoyo + MEDIDAS_DISCO.espesor / 2, centroPlato.z),
  );
}

/** Viaja al plato acostándose, baja hasta el eje y la cámara pasa a la vista del tocadiscos. */
function agregarViajeAlPlato(
  linea: gsap.core.Timeline,
  { disco, tocadiscos, camara }: PiezasDisco,
): void {
  const apoyo = calcularApoyo(tocadiscos);
  const vistas = obtenerVistas(camara.aspect);
  const { viaje, bajada } = T;
  linea.to(
    disco.position,
    { x: apoyo.x, y: apoyo.y + ALTURA_SOBRE_PLATO, z: apoyo.z, duration: viaje.duracion },
    enT(viaje.inicio),
  );
  linea.to(disco.rotation, { x: 0, duration: viaje.duracion }, enT(viaje.inicio));
  linea.to(
    disco.position,
    { y: apoyo.y, duration: bajada.duracion, ease: 'power1.in' },
    enT(bajada.inicio),
  );
  agregarViajeCamara(
    linea,
    {
      camara,
      desde: vistas.funda,
      hasta: vistas.tocadiscos,
      duracion: viaje.duracion + bajada.duracion,
    },
    enT(viaje.inicio),
  );
}

/** El brazo se levanta, va hasta el borde del disco y baja la aguja. */
function agregarBrazo(linea: gsap.core.Timeline, { brazo }: Tocadiscos): void {
  linea.to(
    brazo.rotation,
    { x: BRAZO.alzado, y: BRAZO.giro, duration: T.brazo.duracion },
    enT(T.brazo.inicio),
  );
  linea.to(brazo.rotation, { x: BRAZO.apoyado, duration: T.aguja.duracion }, enT(T.aguja.inicio));
}

/**
 * Del sobre al plato: agrega los pasos al timeline de apertura y devuelve el giro (tween
 * aparte, pausado): arranca cuando el disco apoya y se pausa si el timeline vuelve atrás.
 */
export function agregarDiscoAlPlato(
  linea: gsap.core.Timeline,
  piezas: PiezasDisco,
): gsap.core.Tween {
  ubicarDiscoAdentro(piezas);
  agregarSalidaDelSobre(linea, piezas);
  agregarViajeAlPlato(linea, piezas);
  agregarBrazo(linea, piezas.tocadiscos);
  const giro = gsap.to([piezas.disco.rotation, piezas.tocadiscos.plato.rotation], {
    y: `-=${Math.PI * 2}`,
    duration: DURACION_VUELTA_DISCO,
    ease: EASE_GIRO,
    repeat: -1,
    paused: true,
    onUpdate: piezas.solicitarRender,
  });
  // `call` se dispara en las dos direcciones: hacia adelante arranca, en reversa se pausa
  linea.call(() => (linea.reversed() ? giro.pause() : giro.play()), [], enT(T.aguja.inicio));
  return giro;
}
