import type { Mesh, PerspectiveCamera, Scene, Texture } from 'three';
import { PROYECTOS } from '../../data/proyectos';
import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearSacarFunda } from './animarSacarDisco';
import { agregarDiscoAlPlato } from './animarTocadiscos';
import { aplicarPortada } from './cargarPortada';
import { crearDisco3d } from './crearDisco3d';
import { crearFundaInterna } from './crearFundaInterna';
import type { Tocadiscos } from './crearTocadiscos';
import { liberarMalla } from './liberar';
import type { FundaEnRepisa } from './ubicarFundas';

/** El cierre va más rápido que la apertura: guardar un disco es más ágil que sacarlo. */
const VELOCIDAD_CIERRE = 1.8;

export interface PiezasAnimador {
  readonly escena: Scene;
  readonly camara: PerspectiveCamera;
  readonly entorno: Texture;
  readonly ladoTextura: number;
  readonly fundas: readonly FundaEnRepisa[];
  readonly tocadiscos: Tocadiscos;
  readonly solicitarRender: () => void;
}

interface Sesion {
  readonly id: string;
  readonly linea: gsap.core.Timeline;
  readonly giro: gsap.core.Tween;
  /** Se crean al abrir y se liberan al cerrar (GPU incluida). */
  readonly temporales: readonly Mesh[];
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
    const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
    if (!funda || !proyecto) {
      return;
    }
    const { escena, entorno, ladoTextura, tocadiscos } = this.piezas;
    const disco = crearDisco3d(proyecto, { ladoTextura, entorno });
    const interna = crearFundaInterna(ladoTextura);
    escena.add(disco);
    funda.malla.add(interna);
    const linea = crearSacarFunda({ ...this.piezas, funda });
    const giro = agregarDiscoAlPlato(linea, { ...this.piezas, funda, disco, interna, tocadiscos });
    linea.eventCallback('onComplete', () => emitir('animacion:abierta', { id }));
    linea.eventCallback('onReverseComplete', () => this.terminarCierre());
    this.sesion = { id, linea, giro, temporales: [disco, interna] };
    void aplicarPortada(proyecto.portada, {
      materialPortada: funda.malla.material[0],
      alAplicar: this.piezas.solicitarRender,
    });
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
    sesion.giro.kill();
    sesion.linea.kill();
    sesion.temporales.forEach((malla) => liberarMalla(malla, [this.piezas.entorno]));
    this.piezas.solicitarRender();
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
