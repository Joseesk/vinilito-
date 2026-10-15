import type { PerspectiveCamera } from 'three';
import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearSacarFunda } from './animarSacarDisco';
import type { FundaEnRepisa } from './ubicarFundas';

/** El cierre va más rápido que la apertura: guardar un disco es más ágil que sacarlo. */
const VELOCIDAD_CIERRE = 1.6;

export interface PiezasAnimador {
  readonly fundas: readonly FundaEnRepisa[];
  readonly camara: PerspectiveCamera;
  readonly solicitarRender: () => void;
}

interface Sesion {
  readonly id: string;
  readonly linea: gsap.core.Timeline;
}

/** Animador del estudio 3D: mismo contrato que el animador CSS (confirma con `animacion:*`). */
class AnimadorEstudio {
  private readonly piezas: PiezasAnimador;
  private sesion: Sesion | null = null;

  constructor(piezas: PiezasAnimador) {
    this.piezas = piezas;
  }

  abrir(id: string): void {
    const funda = this.piezas.fundas.find((candidata) => candidata.id === id);
    if (!funda) {
      return;
    }
    const linea = crearSacarFunda({ ...this.piezas, funda });
    linea.eventCallback('onComplete', () => emitir('animacion:abierta', { id }));
    linea.eventCallback('onReverseComplete', () => this.terminarCierre());
    this.sesion = { id, linea };
    linea.timeScale(1).play();
  }

  cerrar(): void {
    if (!this.sesion) {
      return;
    }
    // reverse() en el instante 0 no dispara onReverseComplete: quedaría trabado
    if (this.sesion.linea.time() === 0) {
      this.terminarCierre();
      return;
    }
    this.sesion.linea.timeScale(VELOCIDAD_CIERRE).reverse();
  }

  private terminarCierre(): void {
    const sesion = this.sesion;
    this.sesion = null;
    if (!sesion) {
      return;
    }
    sesion.linea.kill();
    emitir('animacion:cerrada', { id: sesion.id });
  }
}

/** Devuelve la función que desconecta los listeners. */
export function conectarAnimadorEstudio(piezas: PiezasAnimador): () => void {
  const animador = new AnimadorEstudio(piezas);
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', ({ id }) => animador.abrir(id)),
    escuchar('vinilo:cerrando', () => animador.cerrar()),
  ]);
}
