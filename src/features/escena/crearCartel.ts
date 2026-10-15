import type { EnlacePerfil, Perfil } from '../../shared/types/perfil';
import { crearElemento, crearIcono } from '../../shared/utils';
import { crearBotonWhatsapp } from './botonWhatsapp';
import { crearEmail } from './crearEmail';

/** Con ícono: el logo a la vista y la etiqueta solo para lectores de pantalla. */
function crearContenidoEnlace({ etiqueta, icono }: EnlacePerfil): (Node | string)[] {
  if (!icono) {
    return [etiqueta];
  }
  return [crearIcono(icono), crearElemento('span', { clases: ['solo-lectores'], texto: etiqueta })];
}

function crearEnlace(enlace: EnlacePerfil): HTMLLIElement {
  const esExterno = enlace.url.startsWith('http');
  const atributos: Record<string, string> = esExterno
    ? { href: enlace.url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: enlace.url };
  return crearElemento('li', {
    hijos: [
      crearElemento('a', {
        clases: ['cartel__enlace', 'boton'],
        atributos,
        hijos: crearContenidoEnlace(enlace),
      }),
    ],
  });
}

/** Contacto: WhatsApp como acción principal; email y redes como enlaces secundarios. */
function crearContacto(perfil: Perfil): HTMLElement {
  const enlaces = crearElemento('ul', {
    clases: ['cartel__enlaces'],
    hijos: [
      crearEmail(perfil.email, perfil.asuntoEmail),
      ...perfil.enlaces.map((enlace) => crearEnlace(enlace)),
    ],
  });
  return crearElemento('address', {
    clases: ['cartel__contacto'],
    hijos: [crearBotonWhatsapp(perfil.whatsapp, ['cartel__whatsapp']), enlaces],
  });
}

/** Cartel pegado en la pared (hero): nombre (único h1), rol, propuesta y contacto. */
export function crearCartel(perfil: Perfil): HTMLElement {
  return crearElemento('header', {
    clases: ['cartel'],
    hijos: [
      crearElemento('h1', { clases: ['cartel__nombre'], texto: perfil.nombre }),
      crearElemento('p', { clases: ['cartel__rol'], texto: perfil.rol }),
      crearElemento('p', { clases: ['cartel__propuesta'], texto: perfil.propuesta }),
      crearContacto(perfil),
    ],
  });
}
