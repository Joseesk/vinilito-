import { emitir } from '../../shared/eventos';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';

function crearFrente(proyecto: Proyecto): HTMLSpanElement {
  return crearElemento('span', {
    clases: ['lomo__frente'],
    hijos: [
      crearElemento('span', { clases: ['lomo__numero'], texto: String(proyecto.numero) }),
      crearElemento('span', { clases: ['lomo__titulo'], texto: proyecto.titulo }),
    ],
  });
}

export function crearLomo(proyecto: Proyecto): HTMLButtonElement {
  // Tres capas, un transform cada una: la intro/funda mueven el <button>, el hover
  // mueve .lomo__cuerpo y la inclinación estática vive en .lomo__frente
  const cuerpo = crearElemento('span', {
    clases: ['lomo__cuerpo'],
    hijos: [crearFrente(proyecto)],
  });
  const lomo = crearElemento('button', {
    clases: ['lomo'],
    atributos: {
      type: 'button',
      'data-id': proyecto.id,
      'aria-expanded': 'false',
      style: `--color-lomo: var(--${proyecto.color})`,
    },
    hijos: [cuerpo],
  });
  lomo.addEventListener('click', () => {
    const { left, top, width, height } = lomo.getBoundingClientRect();
    const origen = { x: left, y: top, ancho: width, alto: height };
    emitir('proyecto:seleccionado', { id: proyecto.id, origen });
  });
  return lomo;
}
