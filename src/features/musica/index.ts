import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { Aguja } from './aguja';
import { ControlMusica } from './controlMusica';

/**
 * Cada disco suena en loop al bajar la aguja y se apaga al guardarlo. Se inicia después de la
 * ficha: el estado inicial (`musica:estado`) tiene que encontrar su botón ya escuchando, y
 * antes del 3D: los sonidos de la aguja se activan con `escena3d:lista`.
 */
export function iniciarMusica(): () => void {
  const aguja = new Aguja();
  const control = new ControlMusica(aguja);
  const alCambiarVisibilidad = (): void => control.alCambiarVisibilidad(document.hidden);
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  const desconectar = combinarDesconexiones([
    escuchar('proyecto:seleccionado', ({ id }) => control.alSeleccionar(id)),
    escuchar('vinilo:abriendo', ({ id }) => control.alAbrirse(id)),
    escuchar('vinilo:abierto', ({ id }) => control.alQuedarAbierto(id)),
    escuchar('vinilo:cerrando', ({ id }) => control.alCerrarse(id)),
    escuchar('vinilo:cerrado', () => control.alQuedarCerrado()),
    escuchar('musica:alternar', () => control.alternar()),
    escuchar('escena3d:lista', () => aguja.activar()),
    () => document.removeEventListener('visibilitychange', alCambiarVisibilidad),
  ]);
  emitir('musica:estado', { silenciada: control.estaSilenciada });
  return desconectar;
}
