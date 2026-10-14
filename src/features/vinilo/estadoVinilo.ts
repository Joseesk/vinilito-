import { PROYECTOS } from '../../data/proyectos';
import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearApertura, iniciarGiro } from './abrirVinilo';
import { crearVinilo } from './crearVinilo';

type EstadoVinilo = 'cerrado' | 'abriendo' | 'abierto' | 'cerrando';

interface SesionVinilo {
  readonly id: string;
  readonly apertura: gsap.core.Timeline;
  /** `null` con movimiento reducido: el disco no gira. */
  readonly giro: gsap.core.Tween | null;
}

/** Dueño único del estado: escena y ficha solo reaccionan a sus eventos. */
class ControlVinilo {
  private readonly escenario: HTMLElement;
  private estado: EstadoVinilo = 'cerrado';
  private sesion: SesionVinilo | null = null;
  /** Lomo elegido mientras otro estaba abierto: se abre al terminar el cierre. */
  private pendiente: string | null = null;

  constructor(escenario: HTMLElement) {
    this.escenario = escenario;
  }

  seleccionar(id: string): void {
    if (this.estado === 'cerrado') {
      this.abrir(id);
      return;
    }
    // Durante una animación se ignora el click: evita estados cruzados
    if (this.estado !== 'abierto' || !this.sesion) {
      return;
    }
    this.pendiente = this.sesion.id === id ? null : id;
    this.cerrar();
  }

  cerrar(): void {
    const puedeCerrar = this.estado === 'abierto' || this.estado === 'abriendo';
    if (!this.sesion || !puedeCerrar) {
      return;
    }
    this.estado = 'cerrando';
    emitir('vinilo:cerrando', { id: this.sesion.id });
    // reverse() en el instante 0 no dispara onReverseComplete: el vinilo quedaría trabado
    if (this.sesion.apertura.time() === 0) {
      this.terminarCierre();
      return;
    }
    this.sesion.apertura.reverse();
  }

  private abrir(id: string): void {
    const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
    if (!proyecto) {
      return;
    }
    const vinilo = crearVinilo(proyecto);
    this.escenario.replaceChildren(vinilo);
    const apertura = crearApertura(this.escenario, vinilo, {
      alAbrir: () => this.terminarApertura(),
      alCerrar: () => this.terminarCierre(),
    });
    this.sesion = { id, apertura, giro: iniciarGiro(vinilo) };
    this.estado = 'abriendo';
    emitir('vinilo:abriendo', { id });
    apertura.play();
  }

  private terminarApertura(): void {
    if (!this.sesion) {
      return;
    }
    this.estado = 'abierto';
    emitir('vinilo:abierto', { id: this.sesion.id });
  }

  private terminarCierre(): void {
    if (!this.sesion) {
      return;
    }
    const { id, apertura, giro } = this.sesion;
    giro?.kill();
    apertura.kill();
    this.escenario.replaceChildren();
    this.sesion = null;
    this.estado = 'cerrado';
    emitir('vinilo:cerrado', { id });
    this.abrirPendiente();
  }

  private abrirPendiente(): void {
    const id = this.pendiente;
    this.pendiente = null;
    if (id) {
      this.abrir(id);
    }
  }
}

/** Devuelve la función que desconecta los listeners. */
export function conectarControlVinilo(escenario: HTMLElement): () => void {
  const control = new ControlVinilo(escenario);
  return combinarDesconexiones([
    escuchar('proyecto:seleccionado', ({ id }) => control.seleccionar(id)),
    escuchar('vinilo:cerrar', () => control.cerrar()),
  ]);
}
