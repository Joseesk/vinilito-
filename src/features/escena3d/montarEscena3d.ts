import { emitir, escuchar } from '../../shared/eventos';
import { crearElemento } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { conectarAnimadorEstudio } from './animadorEstudio';
import { crearCapaAccesible } from './capaAccesible';
import { construirEstudio } from './crearEstudio';
import { animarIntro3d } from './intro3d';
import { crearEscena3d, type Escena3d } from './renderizador';
import type { FundaEnRepisa } from './ubicarFundas';

export interface EstudioMontado {
  readonly escena3d: Escena3d;
  readonly fundas: readonly FundaEnRepisa[];
}

/**
 * Punto de entrada del chunk dinámico (todo lo que importa `three` cuelga de acá).
 * Lienzo y viñeta van al principio (fondo). Los botones accesibles van al final: así el
 * orden de Tab es cartel → discos → ficha. El vinilo y la ficha quedan encima por `z-index`.
 */
export function montarEscena3d(
  contenedor: HTMLElement,
  calidad: ConfiguracionCalidad,
): EstudioMontado {
  const lienzo = crearElemento('canvas', {
    clases: ['escena3d'],
    atributos: { 'aria-hidden': 'true', 'data-calidad': calidad.nivel },
  });
  const vineta = crearElemento('div', {
    clases: ['escena3d__vineta'],
    atributos: { 'aria-hidden': 'true' },
  });
  contenedor.prepend(lienzo, vineta);
  const escena3d = crearEscena3d(lienzo, calidad);
  const { fundas, luces } = construirEstudio(escena3d, calidad);
  const capa = crearCapaAccesible({ ...escena3d, fundas });
  conectarAnimadorEstudio({ ...escena3d, fundas });
  contenedor.append(capa.nav);
  escena3d.alRedimensionar(capa.ubicar);
  escena3d.solicitarRender();
  // Se registra después del render pedido: en el mismo frame corre justo detrás de él
  requestAnimationFrame(() => {
    capa.ubicar();
    contenedor.dataset['escena3d'] = 'lista';
    emitir('escena3d:lista');
  });
  // Los `from()` aplican el estado inicial (luz apagada) antes del primer cuadro
  const intro = animarIntro3d({ luces, fundas, solicitarRender: escena3d.solicitarRender });
  // Si se abre un disco durante la intro, se completa ya: las fundas tienen que estar en su lugar
  escuchar('vinilo:abriendo', () => intro.progress(1));
  return { escena3d, fundas };
}
