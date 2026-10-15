import { emitir } from '../../shared/eventos';
import type { Pista } from '../../shared/types/musica';
import { crearElemento, crearIcono, obtenerElemento } from '../../shared/utils';

const CLASE_SILENCIO = 'boton__icono--silencio';

/** `aria-pressed` = silenciada: el lector anuncia "Silenciar música, activado/desactivado". */
export function actualizarBotonSonido(boton: HTMLElement, silenciada: boolean): void {
  boton.setAttribute('aria-pressed', String(silenciada));
  obtenerElemento('.boton__icono', boton).classList.toggle(CLASE_SILENCIO, silenciada);
}

/** La música es de otra feature: el botón solo pide el cambio y refleja `musica:estado`. */
export function crearBotonSonido(silenciada: boolean): HTMLButtonElement {
  const boton = crearElemento('button', {
    clases: ['ficha__sonido', 'boton'],
    atributos: { type: 'button', 'aria-label': 'Silenciar música' },
    hijos: [crearIcono('sonido')],
  });
  actualizarBotonSonido(boton, silenciada);
  boton.addEventListener('click', () => emitir('musica:alternar'));
  return boton;
}

function crearEnlaceExterno(texto: string, href: string): HTMLAnchorElement {
  return crearElemento('a', {
    texto,
    atributos: { href, target: '_blank', rel: 'noopener noreferrer' },
  });
}

/** Crédito que exige la licencia (CC BY): título, autor y licencia, con sus enlaces. */
export function crearCredito(pista: Pista): HTMLParagraphElement {
  return crearElemento('p', {
    clases: ['ficha__credito'],
    hijos: [
      `♪ "${pista.titulo}" — `,
      crearEnlaceExterno(pista.autor, pista.fuente),
      ' · ',
      crearEnlaceExterno(pista.licencia, pista.urlLicencia),
    ],
  });
}
