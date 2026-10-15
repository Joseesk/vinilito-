import {
  ACESFilmicToneMapping,
  Color,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  type Texture,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { leerToken } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';

/** Lente algo tele: una repisa vista de frente se deforma menos que con gran angular. */
const CAMPO_VISION = 35;
const PLANO_CERCANO = 0.1;
const PLANO_LEJANO = 100;
/** Algo por debajo de 1: con ACES los colores saturados de los lomos no se lavan. */
const EXPOSICION = 0.85;

export interface Escena3d {
  readonly escena: Scene;
  readonly camara: PerspectiveCamera;
  readonly lienzo: HTMLCanvasElement;
  /**
   * Reflejos generados por código (sin descargar un HDR) para metal y vinilo. Se aplica
   * como `envMap` solo a esos materiales: como entorno global aclaraba todo el cuarto.
   */
  readonly entorno: Texture;
  /** Pide un cuadro. Varios pedidos en el mismo frame se dibujan una sola vez. */
  readonly solicitarRender: () => void;
  /** Avisa cada cambio de tamaño del lienzo (después de ajustar cámara y renderer). */
  readonly alRedimensionar: (accion: () => void) => void;
  readonly destruir: () => void;
}

function crearRenderer(canvas: HTMLCanvasElement, calidad: ConfiguracionCalidad): WebGLRenderer {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: calidad.antialias,
    powerPreference: calidad.nivel === 'baja' ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, calidad.dprMaximo));
  renderer.shadowMap.enabled = calidad.sombras;
  renderer.shadowMap.type = PCFSoftShadowMap;
  // Curva de tono "de cine": las altas luces del spot no se queman a blanco
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = EXPOSICION;
  return renderer;
}

/** Render a demanda: nada se dibuja si nada cambió (ahorra batería en celulares). */
function crearDibujante(dibujar: () => void): () => void {
  let hayPedido = false;
  return () => {
    if (hayPedido) {
      return;
    }
    hayPedido = true;
    // rAF no corre con la pestaña oculta: el pedido queda en espera sin gastar nada
    requestAnimationFrame(() => {
      hayPedido = false;
      dibujar();
    });
  };
}

export function crearEscena3d(lienzo: HTMLCanvasElement, calidad: ConfiguracionCalidad): Escena3d {
  const renderer = crearRenderer(lienzo, calidad);
  const escena = new Scene();
  escena.background = new Color(leerToken('--estudio-pared'));
  const generador = new PMREMGenerator(renderer);
  const entorno = generador.fromScene(new RoomEnvironment()).texture;
  generador.dispose();
  const camara = new PerspectiveCamera(CAMPO_VISION, 1, PLANO_CERCANO, PLANO_LEJANO);
  const solicitarRender = crearDibujante(() => renderer.render(escena, camara));
  const acciones: (() => void)[] = [];
  const observador = new ResizeObserver(() => {
    renderer.setSize(lienzo.clientWidth, lienzo.clientHeight, false);
    camara.aspect = lienzo.clientWidth / Math.max(lienzo.clientHeight, 1);
    camara.updateProjectionMatrix();
    acciones.forEach((accion) => accion());
    solicitarRender();
  });
  observador.observe(lienzo);
  const destruir = (): void => {
    observador.disconnect();
    renderer.dispose();
  };
  const alRedimensionar = (accion: () => void): void => {
    acciones.push(accion);
  };
  return { escena, camara, lienzo, entorno, solicitarRender, alRedimensionar, destruir };
}
