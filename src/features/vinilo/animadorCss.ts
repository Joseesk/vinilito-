import { PROYECTOS } from '../../data/proyectos';
import { emitir, escuchar } from '../../shared/eventos';
import type { PayloadSeleccion } from '../../shared/types/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearApertura, iniciarGiro } from './abrirVinilo';
import { crearVinilo } from './crearVinilo';

interface SesionAnimacion {
  readonly id: string;
  readonly apertura: gsap.core.Timeline;
  /** `null` con movimiento reducido: el disco no gira. */
  readonly giro: gsap.core.Tween | null;
}

/** Animador de la versión CSS (placeholder y respaldo sin WebGL). */
class AnimadorCss {
  private readonly escenario: HTMLElement;
  private sesion: SesionAnimacion | null = null;

  constructor(escenario: HTMLElement) {
    this.escenario = escenario;
  }

  abrir({ id, origen }: PayloadSeleccion): void {
    this.descartar();
    const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
    if (!proyecto) {
      return;
    }
    const conjunto = crearVinilo(proyecto);
    // Montado antes de crear la apertura: el FLIP mide su posición final
    this.escenario.replaceChildren(conjunto);
    const apertura = crearApertura(
      { escenario: this.escenario, conjunto, origen },
      { alAbrir: () => emitir('animacion:abierta', { id }), alCerrar: () => this.terminarCierre() },
    );
    this.sesion = { id, apertura, giro: iniciarGiro(conjunto) };
    apertura.play();
  }

  cerrar(): void {
    if (!this.sesion) {
      return;
    }
    // reverse() en el instante 0 no dispara onReverseComplete: quedaría trabado
    if (this.sesion.apertura.time() === 0) {
      this.terminarCierre();
      return;
    }
    this.sesion.apertura.reverse();
  }

  private terminarCierre(): void {
    const id = this.sesion?.id;
    this.descartar();
    if (id !== undefined) {
      emitir('animacion:cerrada', { id });
    }
  }

  /** Quita lo que haya en escena sin avisar (también sirve si quedó algo de antes). */
  private descartar(): void {
    this.sesion?.giro?.kill();
    this.sesion?.apertura.kill();
    this.escenario.replaceChildren();
    this.sesion = null;
  }
}

/** Devuelve la función que desconecta los listeners. */
export function conectarAnimadorCss(escenario: HTMLElement): () => void {
  const animador = new AnimadorCss(escenario);
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', (seleccion) => animador.abrir(seleccion)),
    escuchar('vinilo:cerrando', () => animador.cerrar()),
  ]);
}
