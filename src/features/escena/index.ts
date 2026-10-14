import './escena.css';
import { PERFIL } from '../../data/perfil';
import { PROYECTOS } from '../../data/proyectos';
import { conectarSeleccion } from './animarSeleccion';
import { construirEscena } from './construirEscena';
import { animarIntro } from './intro';

export function iniciarEscena(contenedor: HTMLElement): void {
  const escena = construirEscena(PROYECTOS, PERFIL);
  contenedor.append(escena);
  conectarSeleccion(escena, animarIntro(escena));
}
