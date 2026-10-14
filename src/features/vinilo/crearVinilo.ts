import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';

/** Tamaño intrínseco fijo de la portada: reserva espacio y evita saltos de layout. */
const LADO_PORTADA_PX = '300';

function crearEtiqueta(proyecto: Proyecto): HTMLDivElement {
  // El número queda debajo de la portada: si la imagen falta, la etiqueta no queda vacía
  const numero = crearElemento('span', {
    clases: ['vinilo__numero'],
    texto: String(proyecto.numero),
  });
  const portada = crearElemento('img', {
    clases: ['vinilo__portada'],
    atributos: {
      src: proyecto.portada,
      alt: '',
      loading: 'lazy',
      width: LADO_PORTADA_PX,
      height: LADO_PORTADA_PX,
    },
  });
  // Sin esto Chrome dibuja el ícono de imagen rota encima del número
  portada.addEventListener('error', () => portada.remove(), { once: true });
  return crearElemento('div', { clases: ['vinilo__etiqueta'], hijos: [numero, portada] });
}

export function crearVinilo(proyecto: Proyecto): HTMLElement {
  // El brillo va fuera del disco: el reflejo de la luz no gira con el vinilo
  const disco = crearElemento('div', {
    clases: ['vinilo__disco'],
    hijos: [crearEtiqueta(proyecto)],
  });
  return crearElemento('div', {
    clases: ['vinilo'],
    atributos: {
      'data-id': proyecto.id,
      style: `--color-etiqueta: var(--${proyecto.color}); --color-numero: var(--${proyecto.colorTexto})`,
    },
    hijos: [disco, crearElemento('div', { clases: ['vinilo__brillo'] })],
  });
}
