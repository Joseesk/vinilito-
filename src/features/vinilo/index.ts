import './vinilo.css';
import { MEDIA_MOVIL, gsap } from '../../shared/animacion';
import { emitir } from '../../shared/eventos';
import { crearElemento } from '../../shared/utils';
import { conectarControlVinilo } from './estadoVinilo';

/** La apertura se calcula para un layout: si se cruza el breakpoint con un disco abierto, se cierra. */
function cerrarAlCambiarLayout(): void {
  gsap.matchMedia().add(MEDIA_MOVIL, () => {
    emitir('vinilo:cerrar');
    return () => emitir('vinilo:cerrar');
  });
}

export function iniciarVinilo(contenedor: HTMLElement): void {
  // Decorativo: la información accesible del proyecto la da la ficha
  const escenario = crearElemento('div', {
    clases: ['vinilo-escenario'],
    atributos: { 'aria-hidden': 'true' },
  });
  contenedor.append(escenario);
  conectarControlVinilo(escenario);
  cerrarAlCambiarLayout();
}
