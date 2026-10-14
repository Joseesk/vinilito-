import { escuchar } from '../../shared/eventos';
import { combinarDesconexiones, devolverFocoSiSePerdio } from '../../shared/utils';
import { buscarLomo } from './lomos';

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
      devolverFocoSiSePerdio(lomo);
    }),
  ]);
}
