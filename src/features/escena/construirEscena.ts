import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';
import { crearLomo } from './crearLomo';

export function construirEscena(proyectos: readonly Proyecto[]): HTMLElement {
  const lomos = crearElemento('nav', {
    clases: ['escena__lomos'],
    atributos: { 'aria-label': 'Proyectos' },
    hijos: proyectos.map((proyecto, indice) => crearLomo(proyecto, indice)),
  });
  return crearElemento('main', { clases: ['escena'], hijos: [lomos] });
}
