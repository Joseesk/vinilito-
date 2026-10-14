import './vinilo.css';
import { crearElemento } from '../../shared/utils';
import { conectarControlVinilo } from './estadoVinilo';

export function iniciarVinilo(contenedor: HTMLElement): void {
  // Decorativo: la información accesible del proyecto la da la ficha
  const escenario = crearElemento('div', {
    clases: ['vinilo-escenario'],
    atributos: { 'aria-hidden': 'true' },
  });
  contenedor.append(escenario);
  conectarControlVinilo(escenario);
}
