import './escena.css';
import { PERFIL } from '../../data/perfil';
import { PROYECTOS } from '../../data/proyectos';
import { escuchar } from '../../shared/eventos';
import { conectarSeleccion } from './animarSeleccion';
import { construirEscena } from './construirEscena';
import { animarIntro } from './intro';
import { conectarEstadoLomos } from './marcarSeleccion';

export function iniciarEscena(contenedor: HTMLElement): void {
  const escena = construirEscena(PROYECTOS, PERFIL);
  contenedor.append(escena);
  conectarSeleccion(escena, animarIntro(escena));
  conectarEstadoLomos(escena);
  // Con el 3D listo, esta escena queda como placeholder: se oculta la repisa CSS
  escuchar('escena3d:lista', () => {
    escena.classList.add('escena--sobre-3d');
    escena
      .querySelectorAll('.cartel__enlace')
      .forEach((enlace) => enlace.classList.add('boton--texto'));
  });
}
