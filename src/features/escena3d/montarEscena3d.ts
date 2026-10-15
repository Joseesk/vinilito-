import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearElemento } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { conectarAnimadorEstudio } from './animadorEstudio';
import { crearCapaAccesible } from './capaAccesible';
import { obtenerVistas, ubicarCamara } from './camara';
import { construirEstudio } from './crearEstudio';
import { animarIntro3d } from './intro3d';
import { crearEscena3d, type Escena3d } from './renderizador';

/**
 * Punto de entrada del chunk dinámico (todo lo que importa `three` cuelga de acá).
 * Lienzo y viñeta van al principio (fondo). Los botones accesibles van al final: así el
 * orden de Tab es cartel → discos → ficha. El vinilo y la ficha quedan encima por `z-index`.
 */
function crearFondo(contenedor: HTMLElement, calidad: ConfiguracionCalidad): HTMLCanvasElement {
  const lienzo = crearElemento('canvas', {
    clases: ['escena3d'],
    atributos: { 'aria-hidden': 'true', 'data-calidad': calidad.nivel },
  });
  const vineta = crearElemento('div', {
    clases: ['escena3d__vineta'],
    atributos: { 'aria-hidden': 'true' },
  });
  contenedor.prepend(lienzo, vineta);
  return lienzo;
}

/**
 * Al cambiar el tamaño (rotar el celular, achicar la ventana) con todo cerrado, la cámara se
 * reencuadra para la nueva proporción. Con un disco abierto la maneja su timeline.
 */
function mantenerVistaGeneral({ camara, alRedimensionar }: Escena3d): () => void {
  let hayDiscoAbierto = false;
  alRedimensionar(() => {
    if (!hayDiscoAbierto) {
      ubicarCamara(camara, obtenerVistas(camara.aspect).general);
    }
  });
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', () => {
      hayDiscoAbierto = true;
    }),
    escuchar('vinilo:cerrado', () => {
      hayDiscoAbierto = false;
    }),
  ]);
}

/** Tras el primer cuadro: alinea los botones y avisa que la escena CSS puede ceder. */
function avisarLista(contenedor: HTMLElement, ubicarBotones: () => void): void {
  requestAnimationFrame(() => {
    ubicarBotones();
    contenedor.dataset['escena3d'] = 'lista';
    emitir('escena3d:lista');
  });
}

export function montarEscena3d(contenedor: HTMLElement, calidad: ConfiguracionCalidad): void {
  const escena3d = crearEscena3d(crearFondo(contenedor, calidad), calidad);
  const { fundas, luces, rincon } = construirEstudio(escena3d, calidad);
  // Antes que los botones: al redimensionar, primero se mueve la cámara y después se alinean
  mantenerVistaGeneral(escena3d);
  const capa = crearCapaAccesible({ ...escena3d, fundas });
  conectarAnimadorEstudio({
    ...escena3d,
    fundas,
    tocadiscos: rincon.tocadiscos,
    ladoTextura: calidad.ladoTextura,
  });
  contenedor.append(capa.nav);
  escena3d.alRedimensionar(capa.ubicar);
  escena3d.solicitarRender();
  // Se registra después del render pedido: en el mismo frame corre justo detrás de él
  avisarLista(contenedor, capa.ubicar);
  // Los `from()` aplican el estado inicial (luz apagada) antes del primer cuadro
  const intro = animarIntro3d({ luces, fundas, solicitarRender: escena3d.solicitarRender });
  // Si se abre un disco durante la intro, se completa ya: las fundas tienen que estar en su lugar
  escuchar('vinilo:abriendo', () => intro.progress(1));
}
