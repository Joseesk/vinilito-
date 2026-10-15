import { SONIDOS_AGUJA } from '../../data/musica';
import { DURACION_CORTE_AGUJA, DURACION_FUNDIDO_MUSICA } from '../../shared/animacion';
import { VOLUMEN_MUSICA, fundirGanancia } from './canal';
import { crearCrepitar } from './crepitar';

/** Golpe y roce un 25 % sobre la música: con el mismo nivel se perdían. El crepitar no cambia. */
const VOLUMEN_AGUJA = VOLUMEN_MUSICA * 1.25;

/** Sin el efecto la música suena igual: un fallo de red o de decodificación se ignora. */
async function descargarSonido(contexto: AudioContext, url: string): Promise<AudioBuffer | null> {
  try {
    const respuesta = await fetch(url);
    return await contexto.decodeAudioData(await respuesta.arrayBuffer());
  } catch {
    return null;
  }
}

function reproducir(sonido: AudioBuffer | null, salida: GainNode): void {
  if (!sonido) {
    return;
  }
  const fuente = salida.context.createBufferSource();
  fuente.buffer = sonido;
  fuente.connect(salida);
  fuente.start();
}

/**
 * Sonidos del brazo: el golpe al bajar, el crepitar del surco mientras suena y el roce al
 * levantar. Solo con el estudio 3D, donde se ve el brazo; sin él la música suena limpia.
 */
export class Aguja {
  private activa = false;
  /** Solo suena al levantarla si estaba sobre el disco (no al cerrar a mitad de la apertura). */
  private apoyada = false;
  private salida: GainNode | null = null;
  private crepitar: GainNode | null = null;
  private baja: AudioBuffer | null = null;
  private sube: AudioBuffer | null = null;

  activar(): void {
    this.activa = true;
  }

  /** Con el contexto de la música (creado en un gesto). Arma todo una sola vez. */
  conectar(contexto: AudioContext): void {
    if (!this.activa || this.salida) {
      return;
    }
    const salida = contexto.createGain();
    salida.gain.value = VOLUMEN_AGUJA;
    salida.connect(contexto.destination);
    this.salida = salida;
    this.crepitar = crearCrepitar(contexto, contexto.destination);
    void this.descargar(contexto);
  }

  bajar(): void {
    if (!this.salida || !this.crepitar) {
      return;
    }
    this.apoyada = true;
    reproducir(this.baja, this.salida);
    fundirGanancia(this.crepitar, VOLUMEN_MUSICA, DURACION_FUNDIDO_MUSICA);
  }

  /** Devuelve si la aguja estaba sobre el disco: ahí la música se corta con ella. */
  subir(): boolean {
    if (!this.apoyada || !this.salida || !this.crepitar) {
      return false;
    }
    this.apoyada = false;
    reproducir(this.sube, this.salida);
    fundirGanancia(this.crepitar, 0, DURACION_CORTE_AGUJA);
    return true;
  }

  /** Botón de silencio: el crepitar se va con la música, sin el roce de levantar. */
  callar(): void {
    this.apoyada = false;
    if (this.crepitar) {
      fundirGanancia(this.crepitar, 0, DURACION_FUNDIDO_MUSICA);
    }
  }

  private async descargar(contexto: AudioContext): Promise<void> {
    const [baja, sube] = await Promise.all([
      descargarSonido(contexto, SONIDOS_AGUJA.baja),
      descargarSonido(contexto, SONIDOS_AGUJA.sube),
    ]);
    this.baja = baja;
    this.sube = sube;
  }
}
