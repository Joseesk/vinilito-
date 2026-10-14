import {
  ACESFilmicToneMapping,
  Color,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { crearElemento, leerToken } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { construirEstudio } from './crearEstudio';
import type { FundaEnRepisa } from './ubicarFundas';

/** Lente algo tele: una repisa vista de frente se deforma menos que con gran angular. */
const CAMPO_VISION = 35;
const PLANO_CERCANO = 0.1;
const PLANO_LEJANO = 100;
/** Algo por debajo de 1: con ACES los colores saturados de los lomos no se lavan. */
const EXPOSICION = 0.85;

export interface Escena3d {
  readonly escena: Scene;
  readonly camara: PerspectiveCamera;
  /** Pide un cuadro. Varios pedidos en el mismo frame se dibujan una sola vez. */
  readonly solicitarRender: () => void;
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
function crearEscena3d(canvas: HTMLCanvasElement, calidad: ConfiguracionCalidad): Escena3d {
  const renderer = crearRenderer(canvas, calidad);
  const escena = new Scene();
  escena.background = new Color(leerToken('--estudio-pared'));
  const camara = new PerspectiveCamera(CAMPO_VISION, 1, PLANO_CERCANO, PLANO_LEJANO);
  let hayPedido = false;
  const solicitarRender = (): void => {
    if (hayPedido) {
      return;
    }
    hayPedido = true;
    // rAF no corre con la pestaña oculta: el pedido queda en espera sin gastar nada
    requestAnimationFrame(() => {
      hayPedido = false;
      renderer.render(escena, camara);
    });
  };
  const ajustarTamanio = (): void => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camara.aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    camara.updateProjectionMatrix();
    solicitarRender();
  };
  const observador = new ResizeObserver(ajustarTamanio);
  observador.observe(canvas);
  const destruir = (): void => {
    observador.disconnect();
    renderer.dispose();
  };
  return { escena, camara, solicitarRender, destruir };
}

export interface EstudioMontado {
  readonly escena3d: Escena3d;
  readonly fundas: readonly FundaEnRepisa[];
}

/** Punto de entrada del chunk dinámico. Marca el contenedor cuando ya hay un cuadro dibujado. */
export function montarEscena3d(
  contenedor: HTMLElement,
  calidad: ConfiguracionCalidad,
): EstudioMontado {
  const canvas = crearElemento('canvas', {
    clases: ['escena3d'],
    atributos: { 'aria-hidden': 'true', 'data-calidad': calidad.nivel },
  });
  const vineta = crearElemento('div', {
    clases: ['escena3d__vineta'],
    atributos: { 'aria-hidden': 'true' },
  });
  contenedor.prepend(canvas, vineta);
  const escena3d = crearEscena3d(canvas, calidad);
  const fundas = construirEstudio(escena3d, calidad);
  escena3d.solicitarRender();
  // Se registra después del render pedido: en el mismo frame corre justo detrás de él
  requestAnimationFrame(() => {
    contenedor.dataset['escena3d'] = 'lista';
  });
  return { escena3d, fundas };
}
