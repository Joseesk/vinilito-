import { emitir } from '../../shared/eventos';
import { obtenerElemento } from '../../shared/utils';

/**
 * Un click en un lomo no cuenta como "fuera": lo resuelve la máquina de estados
 * del vinilo (mismo lomo = cerrar, otro = cambiar de proyecto).
 */
const SELECTOR_LOMO = '.lomo';

function esClickFuera(evento: MouseEvent, ficha: HTMLElement): boolean {
  const destino = evento.target;
  if (!(destino instanceof Element)) {
    return false;
  }
  return !ficha.contains(destino) && destino.closest(SELECTOR_LOMO) === null;
}

/** Botón, `Esc` y click fuera piden cerrar. Devuelve la función que quita los listeners. */
export function conectarCierre(ficha: HTMLElement): () => void {
  const cerrar = (): void => emitir('vinilo:cerrar');
  const alTeclear = (evento: KeyboardEvent): void => {
    if (evento.key === 'Escape') {
      cerrar();
    }
  };
  const alClickear = (evento: MouseEvent): void => {
    if (esClickFuera(evento, ficha)) {
      cerrar();
    }
  };
  const boton = obtenerElemento('.ficha__cerrar', ficha);
  boton.addEventListener('click', cerrar);
  document.addEventListener('keydown', alTeclear);
  document.addEventListener('click', alClickear);
  return () => {
    boton.removeEventListener('click', cerrar);
    document.removeEventListener('keydown', alTeclear);
    document.removeEventListener('click', alClickear);
  };
}
