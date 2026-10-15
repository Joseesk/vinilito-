import type { Mesh, PerspectiveCamera, Scene, Texture } from 'three';
import { prefiereMenosMovimiento } from '../../shared/animacion';
import { PROYECTOS } from '../../data/proyectos';
import type { Proyecto } from '../../shared/types/proyecto';
import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { crearSacarFunda } from './animarSacarDisco';
import { agregarDiscoAlPlato } from './animarTocadiscos';
import { aplicarPortada } from './cargarPortada';
import { crearDisco3d } from './crearDisco3d';
import { crearFundaInterna } from './crearFundaInterna';
import type { Tocadiscos } from './crearTocadiscos';
import { liberarMalla } from './liberar';
import { envolverEnFundido } from './transicionReducida';
import type { FundaEnRepisa } from './ubicarFundas';

/** El cierre va más rápido que la apertura: guardar un disco es más ágil que sacarlo. */
const VELOCIDAD_CIERRE = 1.8;

export interface PiezasAnimador {
  readonly escena: Scene;
  readonly camara: PerspectiveCamera;
  readonly entorno: Texture;
  readonly lienzo: HTMLCanvasElement;
  readonly ladoTextura: number;
  readonly fundas: readonly FundaEnRepisa[];
  readonly tocadiscos: Tocadiscos;
  readonly solicitarRender: () => void;
}

interface Sesion {
  readonly id: string;
  readonly linea: gsap.core.Timeline;
  /** La secuencia real (con movimiento reducido `linea` es el fundido que la envuelve). */
  readonly completa: gsap.core.Timeline;
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
    const { linea, completa, giro, temporales } = this.armar(funda, proyecto);
    linea.eventCallback('onComplete', () => emitir('animacion:abierta', { id }));
    linea.eventCallback('onReverseComplete', () => this.terminarCierre());
    this.sesion = { id, linea, completa, giro, temporales };
    linea.timeScale(1).play();
  }

  /** Disco y funda interna se crean por apertura; con movimiento reducido, fundido. */
  private armar(funda: FundaEnRepisa, proyecto: Proyecto): Omit<Sesion, 'id'> {
    const { escena, entorno, ladoTextura, tocadiscos, lienzo } = this.piezas;
    const { malla: disco, materialEtiqueta } = crearDisco3d(proyecto, { ladoTextura, entorno });
    // Una sola descarga: la misma portada va a la funda y a la etiqueta del disco
    void aplicarPortada(proyecto.portada, {
      materiales: [funda.malla.material[0], materialEtiqueta],
      alAplicar: this.piezas.solicitarRender,
    });
    const interna = crearFundaInterna(ladoTextura);
    escena.add(disco);
    funda.malla.add(interna);
    const completa = crearSacarFunda({ ...this.piezas, funda });
    const piezasDisco = { ...this.piezas, funda, disco, interna, tocadiscos };
    const giro = agregarDiscoAlPlato(completa, piezasDisco);
    const linea = prefiereMenosMovimiento() ? envolverEnFundido(completa, lienzo) : completa;
    return { linea, completa, giro, temporales: [disco, interna] };
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
    sesion.completa.kill();
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
