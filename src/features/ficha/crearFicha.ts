import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';

const ID_TITULO = 'ficha-titulo';

function crearCabecera(proyecto: Proyecto): HTMLDivElement {
  return crearElemento('div', {
    clases: ['ficha__cabecera'],
    hijos: [
      crearElemento('span', { clases: ['ficha__numero'], texto: String(proyecto.numero) }),
      crearElemento('span', { clases: ['ficha__anio'], texto: String(proyecto.anio) }),
      crearElemento('button', {
        clases: ['ficha__cerrar'],
        texto: '×',
        atributos: { type: 'button', 'aria-label': 'Cerrar proyecto' },
      }),
    ],
  });
}

function crearCuerpo(proyecto: Proyecto): HTMLDivElement {
  return crearElemento('div', {
    clases: ['ficha__cuerpo'],
    hijos: [
      crearElemento('h2', {
        clases: ['ficha__titulo'],
        texto: proyecto.titulo,
        atributos: { id: ID_TITULO },
      }),
      crearElemento('p', { clases: ['ficha__descripcion'], texto: proyecto.descripcion }),
      crearElemento('a', {
        clases: ['ficha__enlace'],
        texto: 'Ver proyecto →',
        atributos: { href: proyecto.enlace, target: '_blank', rel: 'noopener noreferrer' },
      }),
    ],
  });
}

export function crearFicha(proyecto: Proyecto): HTMLElement {
  return crearElemento('aside', {
    clases: ['ficha'],
    atributos: {
      'aria-labelledby': ID_TITULO,
      // Enfocable por código (no con Tab) para llevar el foco a la ficha al abrirse
      tabindex: '-1',
      style: `--color-ficha: var(--${proyecto.color})`,
    },
    hijos: [crearCabecera(proyecto), crearCuerpo(proyecto)],
  });
}
