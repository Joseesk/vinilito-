import { PISTAS } from '../../data/musica';
import { PROYECTOS } from '../../data/proyectos';
import { DURACION_CORTE_AGUJA, DURACION_FUNDIDO_MUSICA, gsap } from '../../shared/animacion';
import { emitir } from '../../shared/eventos';
import { debeAhorrarDatos, leerSenales } from '../../shared/utils';
import type { Aguja } from './aguja';
import { type Canal, VOLUMEN_MUSICA, crearCanal, fundirGanancia, prepararCanal } from './canal';
import { guardarSilencio, leerSilencio } from './preferencia';

type Momento = 'cerrado' | 'abriendo' | 'abierto' | 'cerrando';

interface Preparado {
  readonly id: string;
  readonly canal: Canal;
}

function buscarUrl(id: string): string | undefined {
  const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
  return proyecto ? PISTAS[proyecto.numero]?.url : undefined;
}

/**
 * Sigue al vinilo por eventos (no conoce su estado). Dos canales: mientras el disco que se
 * guarda se apaga con fundido, el nuevo ya se prepara en el otro.
 */
export class ControlMusica {
  private contexto: AudioContext | null = null;
  private canales: readonly Canal[] = [];
  private momento: Momento = 'cerrado';
  /** Disco que se está abriendo, está abierto o se está cerrando. */
  private objetivo: string | null = null;
  private preparado: Preparado | null = null;
  private sonando: Canal | null = null;
  private readonly pausas = new Map<Canal, gsap.core.Tween>();
  private silenciada: boolean;
  private readonly aguja: Aguja;

  constructor(aguja: Aguja) {
    this.aguja = aguja;
    // Sin preferencia guardada suena, salvo ahorrando datos: ahí no se descarga audio sin pedirlo
    this.silenciada = leerSilencio() ?? debeAhorrarDatos(leerSenales());
  }

  get estaSilenciada(): boolean {
    return this.silenciada;
  }

  /**
   * Dentro del click. El vinilo ya reaccionó (emitió `abriendo`/`cerrando`), así que: en
   * `abriendo` solo vale el disco que se abre; si no, cualquier disco que no sea el que se va.
   */
  alSeleccionar(id: string): void {
    const esElQueSeVa = id === this.objetivo && this.momento !== 'abriendo';
    const esClickIgnorado = this.momento === 'abriendo' && id !== this.objetivo;
    if (this.silenciada || esElQueSeVa || esClickIgnorado || this.preparado?.id === id) {
      return;
    }
    this.preparar(id);
  }

  alAbrirse(id: string): void {
    this.momento = 'abriendo';
    this.objetivo = id;
    if (this.preparado && this.preparado.id !== id) {
      this.descartarPreparado();
    }
  }

  /** La aguja ya bajó: empieza la música. */
  alQuedarAbierto(id: string): void {
    this.momento = 'abierto';
    if (this.silenciada) {
      return;
    }
    if (this.preparado?.id !== id) {
      this.preparar(id);
    }
    this.sonar();
  }

  alCerrarse(id: string): void {
    this.momento = 'cerrando';
    this.objetivo = id;
    // Como un vinilo real: sin aguja no hay música, y el roce de levantarla se oye en silencio
    this.apagarSonando(this.aguja.subir() ? DURACION_CORTE_AGUJA : DURACION_FUNDIDO_MUSICA);
  }

  alQuedarCerrado(): void {
    this.momento = 'cerrado';
    this.objetivo = null;
    // Si había otro disco pendiente, su `abriendo` llega en este mismo paso; si no, el
    // preparado era un click ignorado y no debe seguir sonando en silencio
    queueMicrotask(() => {
      if (this.momento === 'cerrado') {
        this.descartarPreparado();
      }
    });
  }

  /** Click en el botón de la ficha (es un gesto: puede arrancar el audio). */
  alternar(): void {
    this.silenciada = !this.silenciada;
    guardarSilencio(this.silenciada);
    emitir('musica:estado', { silenciada: this.silenciada });
    if (this.silenciada) {
      this.aguja.callar();
      this.apagarSonando();
      this.descartarPreparado();
      return;
    }
    if (this.momento === 'abierto' && this.objetivo) {
      this.preparar(this.objetivo);
      this.sonar();
    }
  }

  /** Pestaña oculta: se suspende todo el audio (y vuelve donde estaba). */
  alCambiarVisibilidad(oculta: boolean): void {
    if (this.contexto) {
      (oculta ? this.contexto.suspend() : this.contexto.resume()).catch(() => undefined);
    }
  }

  private preparar(id: string): void {
    const url = buscarUrl(id);
    if (!url) {
      return;
    }
    const canal = this.obtenerCanalLibre();
    this.pausas.get(canal)?.kill();
    this.pausas.delete(canal);
    prepararCanal(canal, url);
    this.preparado = { id, canal };
  }

  private sonar(): void {
    const preparado = this.preparado;
    if (!preparado) {
      return;
    }
    this.preparado = null;
    // La pista empieza con la aguja, no cuando se eligió el disco
    preparado.canal.audio.currentTime = 0;
    fundirGanancia(preparado.canal.ganancia, VOLUMEN_MUSICA, DURACION_FUNDIDO_MUSICA);
    this.aguja.bajar();
    this.sonando = preparado.canal;
  }

  private apagarSonando(duracion = DURACION_FUNDIDO_MUSICA): void {
    const canal = this.sonando;
    this.sonando = null;
    if (!canal) {
      return;
    }
    fundirGanancia(canal.ganancia, 0, duracion);
    const pausa = gsap.delayedCall(duracion, () => {
      canal.audio.pause();
      this.pausas.delete(canal);
    });
    this.pausas.set(canal, pausa);
  }

  private descartarPreparado(): void {
    this.preparado?.canal.audio.pause();
    this.preparado = null;
  }

  private obtenerCanalLibre(): Canal {
    // El contexto se crea y reanuda dentro de un gesto: si no, el navegador lo deja mudo
    this.contexto ??= new AudioContext();
    this.contexto.resume().catch(() => undefined);
    this.aguja.conectar(this.contexto);
    if (this.canales.length === 0) {
      this.canales = [crearCanal(this.contexto), crearCanal(this.contexto)];
    }
    // Uno que se está apagando (con pausa pendiente) también está ocupado, salvo que no haya otro
    const libre =
      this.canales.find((canal) => canal !== this.sonando && !this.pausas.has(canal)) ??
      this.canales.find((canal) => canal !== this.sonando);
    if (!libre) {
      throw new Error('Sin canal de audio libre');
    }
    return libre;
  }
}
