import { crearElemento } from '../../shared/utils';

/** Música de fondo: que acompañe sin tapar una conversación. La aguja parte de este nivel. */
export const VOLUMEN_MUSICA = 0.15;

/**
 * Un `<audio>` conectado a la Web Audio API: el volumen va por un nodo de ganancia porque en
 * iPhone `audio.volume` es de solo lectura (sonaría al volumen del teléfono).
 */
export interface Canal {
  readonly audio: HTMLAudioElement;
  readonly ganancia: GainNode;
}

export function crearCanal(contexto: AudioContext): Canal {
  // crossorigin: una URL de CDN sin CORS sonaría en silencio dentro de la Web Audio API
  const audio = crearElemento('audio', {
    atributos: { preload: 'none', crossorigin: 'anonymous' },
  });
  audio.loop = true;
  const ganancia = contexto.createGain();
  ganancia.gain.value = 0;
  contexto.createMediaElementSource(audio).connect(ganancia).connect(contexto.destination);
  return { audio, ganancia };
}

/**
 * Arranca la pista en silencio. Se llama dentro del click que eligió el disco: Safari solo deja
 * reproducir lo que se inició en un gesto, aunque suene recién al bajar la aguja.
 */
export function prepararCanal(canal: Canal, url: string): void {
  const { audio } = canal;
  canal.ganancia.gain.cancelScheduledValues(0);
  canal.ganancia.gain.value = 0;
  if (audio.getAttribute('src') !== url) {
    audio.src = url;
  }
  audio.currentTime = 0;
  // Si el navegador lo bloquea, el disco igual se abre: solo no suena
  audio.play().catch(() => undefined);
}

/** Lleva el volumen a `destino` en `duracion` segundos (fundido lineal sin escalones). */
export function fundirGanancia(ganancia: GainNode, destino: number, duracion: number): void {
  const { gain } = ganancia;
  const ahora = ganancia.context.currentTime;
  gain.cancelScheduledValues(ahora);
  gain.setValueAtTime(gain.value, ahora);
  gain.linearRampToValueAtTime(destino, ahora + duracion);
}
