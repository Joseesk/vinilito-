import type { Perfil } from '../../shared/types/perfil';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';
import { crearLomo } from './crearLomo';
import { crearLosa } from './crearLosa';

export function construirEscena(proyectos: readonly Proyecto[], perfil: Perfil): HTMLElement {
  const lomos = crearElemento('nav', {
    clases: ['escena__lomos'],
    atributos: { 'aria-label': 'Proyectos' },
    hijos: proyectos.map((proyecto, indice) => crearLomo(proyecto, indice)),
  });
  return crearElemento('main', { clases: ['escena'], hijos: [crearLosa(perfil), lomos] });
}
