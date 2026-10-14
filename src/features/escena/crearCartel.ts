import type { Perfil } from '../../shared/types/perfil';
import { crearElemento } from '../../shared/utils';

function crearEnlace(etiqueta: string, url: string): HTMLLIElement {
  const esExterno = url.startsWith('http');
  const atributos: Record<string, string> = esExterno
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url };
  return crearElemento('li', {
    hijos: [
      crearElemento('a', { clases: ['cartel__enlace', 'boton'], texto: etiqueta, atributos }),
    ],
  });
}

/** Cartel pegado en la pared con el perfil: nombre (único h1), rol y contacto. */
export function crearCartel(perfil: Perfil): HTMLElement {
  const enlaces = crearElemento('ul', {
    clases: ['cartel__enlaces'],
    hijos: [
      crearEnlace(perfil.email, `mailto:${perfil.email}`),
      ...perfil.enlaces.map((enlace) => crearEnlace(enlace.etiqueta, enlace.url)),
    ],
  });
  return crearElemento('header', {
    clases: ['cartel'],
    hijos: [
      crearElemento('h1', { clases: ['cartel__nombre'], texto: perfil.nombre }),
      crearElemento('p', { clases: ['cartel__rol'], texto: perfil.rol }),
      crearElemento('address', { clases: ['cartel__contacto'], hijos: [enlaces] }),
    ],
  });
}
