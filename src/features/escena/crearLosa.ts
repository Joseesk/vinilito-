import type { Perfil } from '../../shared/types/perfil';
import { crearElemento } from '../../shared/utils';

function crearEnlace(etiqueta: string, url: string): HTMLLIElement {
  const esExterno = url.startsWith('http');
  const atributos: Record<string, string> = esExterno
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url };
  return crearElemento('li', {
    hijos: [crearElemento('a', { clases: ['losa__enlace'], texto: etiqueta, atributos })],
  });
}

export function crearLosa(perfil: Perfil): HTMLElement {
  const enlaces = crearElemento('ul', {
    clases: ['losa__enlaces'],
    hijos: [
      crearEnlace(perfil.email, `mailto:${perfil.email}`),
      ...perfil.enlaces.map((enlace) => crearEnlace(enlace.etiqueta, enlace.url)),
    ],
  });
  return crearElemento('header', {
    clases: ['losa'],
    hijos: [
      crearElemento('h1', { clases: ['losa__nombre'], texto: perfil.nombre }),
      crearElemento('p', { clases: ['losa__rol'], texto: perfil.rol }),
      crearElemento('address', { clases: ['losa__contacto'], hijos: [enlaces] }),
    ],
  });
}
