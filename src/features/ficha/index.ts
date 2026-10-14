import './ficha.css';
import { conectarFicha } from './controlFicha';

export function iniciarFicha(contenedor: HTMLElement): void {
  conectarFicha(contenedor);
}
