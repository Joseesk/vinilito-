import { escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { buscarLomo } from './lomos';

/**
 * Solo si el foco quedó "perdido" en body (se quitó la ficha que lo tenía).
 * Si el usuario ya está en otro lomo (cambio de proyecto), no se le roba.
 */
function devolverFoco(lomo: HTMLElement): void {
  const activo = document.activeElement;
  if (activo === null || activo === document.body) {
    lomo.focus();
  }
}

/** `aria-expanded` del lomo y foco de vuelta al cerrar. Devuelve la desconexión. */
export function conectarEstadoLomos(escena: HTMLElement): () => void {
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', ({ id }) => {
      buscarLomo(escena, id)?.setAttribute('aria-expanded', 'true');
    }),
    escuchar('vinilo:cerrado', ({ id }) => {
      const lomo = buscarLomo(escena, id);
      if (!lomo) {
        return;
      }
      lomo.setAttribute('aria-expanded', 'false');
      devolverFoco(lomo);
    }),
  ]);
}
