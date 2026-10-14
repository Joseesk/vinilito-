import { PROYECTOS } from '../../data/proyectos';
import { emitir, escuchar } from '../../shared/eventos';
import type { PayloadSeleccion } from '../../shared/types/eventos';
import { combinarDesconexiones } from '../../shared/utils';

type EstadoVinilo = 'cerrado' | 'abriendo' | 'abierto' | 'cerrando';

/**
 * Dueño único del estado. No anima nada: avisa `vinilo:abriendo`/`vinilo:cerrando` y
 * espera que el animador activo (CSS o 3D) confirme con `animacion:abierta`/`animacion:cerrada`.
 */
class ControlVinilo {
  private estado: EstadoVinilo = 'cerrado';
  private actual: string | null = null;
  /** Lomo elegido mientras otro estaba abierto: se abre al terminar el cierre. */
  private pendiente: PayloadSeleccion | null = null;

  seleccionar(seleccion: PayloadSeleccion): void {
    if (this.estado === 'cerrado') {
      this.abrir(seleccion);
      return;
    }
    // Durante una animación se ignora el click: evita estados cruzados
    if (this.estado !== 'abierto' || this.actual === null) {
      return;
    }
    this.pendiente = this.actual === seleccion.id ? null : seleccion;
    this.cerrar();
  }

  cerrar(): void {
    const puedeCerrar = this.estado === 'abierto' || this.estado === 'abriendo';
    if (this.actual === null || !puedeCerrar) {
      return;
    }
    this.estado = 'cerrando';
    emitir('vinilo:cerrando', { id: this.actual });
  }

  confirmarApertura(id: string): void {
    // Puede llegar tarde si se pidió cerrar a mitad de la apertura: se descarta
    if (this.estado !== 'abriendo' || this.actual !== id) {
      return;
    }
    this.estado = 'abierto';
    emitir('vinilo:abierto', { id });
  }

  confirmarCierre(id: string): void {
    if (this.estado !== 'cerrando' || this.actual !== id) {
      return;
    }
    this.actual = null;
    this.estado = 'cerrado';
    emitir('vinilo:cerrado', { id });
    this.abrirPendiente();
  }

  private abrir(seleccion: PayloadSeleccion): void {
    // Un id desconocido dejaría el estado esperando una animación que nadie hará
    if (!PROYECTOS.some((proyecto) => proyecto.id === seleccion.id)) {
      return;
    }
    this.actual = seleccion.id;
    this.estado = 'abriendo';
    emitir('vinilo:abriendo', seleccion);
  }

  private abrirPendiente(): void {
    const seleccion = this.pendiente;
    this.pendiente = null;
    if (seleccion) {
      this.abrir(seleccion);
    }
  }
}

/** Devuelve la función que desconecta los listeners. */
export function conectarControlVinilo(): () => void {
  const control = new ControlVinilo();
  return combinarDesconexiones([
    escuchar('proyecto:seleccionado', (seleccion) => control.seleccionar(seleccion)),
    escuchar('vinilo:cerrar', () => control.cerrar()),
    escuchar('animacion:abierta', ({ id }) => control.confirmarApertura(id)),
    escuchar('animacion:cerrada', ({ id }) => control.confirmarCierre(id)),
  ]);
}
