import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento } from '../../shared/utils';

/** Tamaño intrínseco fijo de la portada: reserva espacio y evita saltos de layout. */
const LADO_PORTADA_PX = '300';

function crearPortada(src: string, clase: string): HTMLImageElement {
  const portada = crearElemento('img', {
    clases: [clase],
    atributos: { src, alt: '', loading: 'lazy', width: LADO_PORTADA_PX, height: LADO_PORTADA_PX },
  });
  // Sin esto Chrome dibuja el ícono de imagen rota encima del número
  portada.addEventListener('error', () => portada.remove(), { once: true });
  return portada;
}

function crearEtiqueta(proyecto: Proyecto): HTMLDivElement {
  // El número queda debajo de la portada: si la imagen falta, la etiqueta no queda vacía
  const numero = crearElemento('span', {
    clases: ['vinilo__numero'],
    texto: String(proyecto.numero),
  });
  return crearElemento('div', {
    clases: ['vinilo__etiqueta'],
    hijos: [numero, crearPortada(proyecto.portada, 'vinilo__portada')],
  });
}

function crearDisco(proyecto: Proyecto): HTMLDivElement {
  // El brillo va fuera del disco: el reflejo de la luz no gira con el vinilo
  const disco = crearElemento('div', {
    clases: ['vinilo__disco'],
    hijos: [crearEtiqueta(proyecto)],
  });
  return crearElemento('div', {
    clases: ['vinilo'],
    hijos: [disco, crearElemento('div', { clases: ['vinilo__brillo'] })],
  });
}

/** Funda cuadrada: portada encima; debajo, número y título por si la imagen falta. */
function crearFunda(proyecto: Proyecto): HTMLDivElement {
  return crearElemento('div', {
    clases: ['funda'],
    hijos: [
      crearElemento('span', { clases: ['funda__numero'], texto: String(proyecto.numero) }),
      crearElemento('span', { clases: ['funda__titulo'], texto: proyecto.titulo }),
      crearPortada(proyecto.portada, 'funda__portada'),
    ],
  });
}

/** Conjunto funda + disco: el disco empieza escondido detrás de la funda y sale de ella. */
export function crearVinilo(proyecto: Proyecto): HTMLElement {
  return crearElemento('div', {
    clases: ['vinilo-conjunto'],
    atributos: { 'data-id': proyecto.id, style: `--color-disco: var(--${proyecto.color})` },
    hijos: [crearDisco(proyecto), crearFunda(proyecto)],
  });
}
