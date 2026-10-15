import { PISTAS } from '../../data/musica';
import type { Pista } from '../../shared/types/musica';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearElemento, crearImagen, obtenerDominio } from '../../shared/utils';
import { crearBotonSonido, crearCredito } from './sonido';

const ID_TITULO = 'ficha-titulo';
/** Tamaño intrínseco 16:10, igual que el `aspect-ratio` del CSS: reserva el alto antes de cargar. */
const CAPTURA_PX = { ancho: 800, alto: 500 } as const;

/** Qué necesita la ficha de la música: la pista del disco (si tiene) y si está silenciada. */
interface SonidoFicha {
  readonly pista: Pista | undefined;
  readonly silenciada: boolean;
}

function crearCabecera(proyecto: Proyecto, { pista, silenciada }: SonidoFicha): HTMLDivElement {
  return crearElemento('div', {
    clases: ['ficha__cabecera'],
    hijos: [
      crearElemento('span', { clases: ['ficha__numero'], texto: String(proyecto.numero) }),
      crearElemento('span', { clases: ['ficha__anio'], texto: String(proyecto.anio) }),
      // Solo con música: el botón aparece justo cuando el disco suena
      ...(pista ? [crearBotonSonido(silenciada)] : []),
      crearElemento('button', {
        clases: ['ficha__cerrar', 'boton'],
        texto: '×',
        atributos: { type: 'button', 'aria-label': 'Cerrar proyecto' },
      }),
    ],
  });
}

/**
 * Captura dentro de una ventana de navegador (barra con puntos y dominio) para que se lea como
 * "página web". La barra es decorativa: el dominio ya lo anuncia el enlace del proyecto.
 */
function crearCaptura(proyecto: Proyecto): HTMLElement {
  const barra = crearElemento('div', {
    clases: ['ficha__barra'],
    atributos: { 'aria-hidden': 'true' },
    hijos: [
      crearElemento('span', { clases: ['ficha__puntos'] }),
      crearElemento('span', { clases: ['ficha__dominio'], texto: obtenerDominio(proyecto.enlace) }),
    ],
  });
  const imagen = crearImagen(proyecto.captura, {
    clases: ['ficha__imagen'],
    alt: `Captura de ${proyecto.titulo}`,
    ...CAPTURA_PX,
  });
  return crearElemento('figure', { clases: ['ficha__captura'], hijos: [barra, imagen] });
}

function crearCuerpo(proyecto: Proyecto, pista: Pista | undefined): HTMLDivElement {
  return crearElemento('div', {
    clases: ['ficha__cuerpo'],
    hijos: [
      crearCaptura(proyecto),
      crearElemento('h2', {
        clases: ['ficha__titulo'],
        texto: proyecto.titulo,
        atributos: { id: ID_TITULO },
      }),
      crearElemento('p', { clases: ['ficha__descripcion'], texto: proyecto.descripcion }),
      crearElemento('a', {
        clases: ['ficha__enlace', 'boton'],
        texto: 'Ver proyecto →',
        atributos: { href: proyecto.enlace, target: '_blank', rel: 'noopener noreferrer' },
      }),
      ...(pista ? [crearCredito(pista)] : []),
    ],
  });
}

export function crearFicha(proyecto: Proyecto, silenciada: boolean): HTMLElement {
  const pista = PISTAS[proyecto.numero];
  return crearElemento('aside', {
    clases: ['ficha'],
    atributos: {
      'aria-labelledby': ID_TITULO,
      // Enfocable por código (no con Tab) para llevar el foco a la ficha al abrirse
      tabindex: '-1',
      style: `--color-ficha: var(--${proyecto.color})`,
    },
    hijos: [crearCabecera(proyecto, { pista, silenciada }), crearCuerpo(proyecto, pista)],
  });
}
