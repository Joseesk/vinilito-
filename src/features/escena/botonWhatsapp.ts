import { prefiereMenosMovimiento } from '../../shared/animacion';
import type { WhatsappPerfil } from '../../shared/types/perfil';
import {
  calcularFlip,
  crearElemento,
  crearEnlaceWhatsapp,
  crearIcono,
  medirElemento,
} from '../../shared/utils';

const TEXTO_WHATSAPP = 'Escríbeme por WhatsApp';

/**
 * Llamado a la acción: ícono (máscara CSS, toma el color del texto) + texto. En el círculo
 * flotante de móvil el texto se oculta a la vista pero lo siguen leyendo los lectores de pantalla.
 */
export function crearBotonWhatsapp(
  whatsapp: WhatsappPerfil,
  clases: readonly string[],
): HTMLAnchorElement {
  return crearElemento('a', {
    clases: ['boton', 'boton--whatsapp', ...clases],
    atributos: {
      href: crearEnlaceWhatsapp(whatsapp.numero, whatsapp.mensaje),
      target: '_blank',
      rel: 'noopener noreferrer',
      // Escribir por WhatsApp no cierra el disco que se está mirando
      'data-mantiene-abierto': '',
    },
    hijos: [
      crearIcono('whatsapp'),
      crearElemento('span', { clases: ['boton__texto'], texto: TEXTO_WHATSAPP }),
    ],
  });
}

export interface PiezasViajeWhatsapp {
  /** Botón del cartel: punto de partida del viaje. */
  readonly origen: HTMLElement;
  /** Botón fijo en su esquina (oculto por CSS hasta que se abre un disco). */
  readonly flotante: HTMLElement;
}

/**
 * Con un disco abierto solo queda el llamado a la acción: el flotante aparece encima del botón
 * del cartel y viaja a su esquina (FLIP). En el mismo timeline: cerrar = `reverse()`.
 */
export function agregarViajeWhatsapp(
  linea: gsap.core.Timeline,
  { origen, flotante }: PiezasViajeWhatsapp,
): void {
  if (prefiereMenosMovimiento()) {
    linea.to(flotante, { autoAlpha: 1 }, 0);
    return;
  }
  linea.set(flotante, { autoAlpha: 1 }, 0);
  linea.from(flotante, calcularFlip(medirElemento(origen), medirElemento(flotante)), 0);
}
