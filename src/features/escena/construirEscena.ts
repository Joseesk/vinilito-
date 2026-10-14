import type { Perfil } from '../../shared/types/perfil';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';
import { crearLomo } from './crearLomo';
import { crearLosa } from './crearLosa';

function crearRepisa(proyectos: readonly Proyecto[]): HTMLDivElement {
  const lomos = crearElemento('nav', {
    clases: ['escena__lomos'],
    atributos: { 'aria-label': 'Proyectos' },
    hijos: proyectos.map((proyecto) => crearLomo(proyecto)),
  });
  // La tabla (con sus ménsulas) es decorativa: el ancho lo da la fila de discos
  const tabla = crearElemento('div', {
    clases: ['repisa__tabla'],
    atributos: { 'aria-hidden': 'true' },
  });
  return crearElemento('div', { clases: ['repisa'], hijos: [lomos, tabla] });
}

export function construirEscena(proyectos: readonly Proyecto[], perfil: Perfil): HTMLElement {
  return crearElemento('main', {
    clases: ['escena'],
    hijos: [crearLosa(perfil), crearRepisa(proyectos)],
  });
}
