import './vinilo.css';
import { crearElemento } from '../../shared/utils';

/** Monta el escenario vacío y oculto; el disco de cada proyecto llega en el Sprint 8a. */
export function iniciarVinilo(contenedor: HTMLElement): void {
  contenedor.append(crearElemento('div', { clases: ['vinilo-escenario'] }));
}
