import { emitir } from '../../shared/eventos';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';

function crearFrente(proyecto: Proyecto): HTMLSpanElement {
  return crearElemento('span', {
    clases: ['lomo__frente'],
    hijos: [
      crearElemento('span', { clases: ['lomo__titulo'], texto: proyecto.titulo }),
      crearElemento('span', { clases: ['lomo__numero'], texto: String(proyecto.numero) }),
    ],
  });
}

/** Variables CSS por lomo: el color sale del token y `--indice` escalona la altura. */
function crearEstilo(proyecto: Proyecto, indice: number): string {
  return [
    `--color-lomo: var(--${proyecto.color})`,
    `--color-texto: var(--${proyecto.colorTexto})`,
    `--indice: ${indice}`,
  ].join('; ');
}

export function crearLomo(proyecto: Proyecto, indice: number): HTMLButtonElement {
  // La intro anima el <button> y el hover anima .lomo__cuerpo: así no pisan el mismo transform
  const cuerpo = crearElemento('span', {
    clases: ['lomo__cuerpo'],
    hijos: [
      crearFrente(proyecto),
      crearElemento('span', { clases: ['lomo__lado'], atributos: { 'aria-hidden': 'true' } }),
    ],
  });
  const lomo = crearElemento('button', {
    clases: ['lomo'],
    atributos: {
      type: 'button',
      'data-id': proyecto.id,
      'aria-expanded': 'false',
      style: crearEstilo(proyecto, indice),
    },
    hijos: [cuerpo],
  });
  lomo.addEventListener('click', () => emitir('proyecto:seleccionado', { id: proyecto.id }));
  return lomo;
}
