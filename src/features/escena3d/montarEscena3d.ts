import { emitir } from '../../shared/eventos';
import { crearElemento } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { crearCapaAccesible } from './capaAccesible';
import { construirEstudio } from './crearEstudio';
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
  const fundas = construirEstudio(escena3d, calidad);
  const capa = crearCapaAccesible({ ...escena3d, fundas });
  contenedor.append(capa.nav);
  escena3d.alRedimensionar(capa.ubicar);
  escena3d.solicitarRender();
  // Se registra después del render pedido: en el mismo frame corre justo detrás de él
  requestAnimationFrame(() => {
    capa.ubicar();
    contenedor.dataset['escena3d'] = 'lista';
    emitir('escena3d:lista');
  });
  return { escena3d, fundas };
}
