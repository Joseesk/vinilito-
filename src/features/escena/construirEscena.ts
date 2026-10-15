import type { Perfil } from '../../shared/types/perfil';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';
import { crearBotonWhatsapp } from './botonWhatsapp';
import { crearLomo } from './crearLomo';
import { crearCartel } from './crearCartel';

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
  // El flotante (oculto hasta abrir un disco) va al final: visible, queda antes de la ficha en el Tab
  const flotante = crearBotonWhatsapp(perfil.whatsapp, ['whatsapp-flotante']);
  return crearElemento('main', {
    clases: ['escena'],
    hijos: [crearCartel(perfil), crearRepisa(proyectos), flotante],
  });
}
