import './escena.css';
import { PROYECTOS } from '../../data/proyectos';
import { construirEscena } from './construirEscena';

export function iniciarEscena(contenedor: HTMLElement): void {
  contenedor.append(construirEscena(PROYECTOS));
}
