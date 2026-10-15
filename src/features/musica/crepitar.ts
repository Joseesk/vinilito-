/**
 * Largo del ruido en loop: con 7 s de chasquidos al azar no se reconoce la repetición (un
 * archivo grabado en loop sí la delata).
 */
const DURACION_BUCLE = 7;
/** Siseo de fondo del surco: apenas audible bajo la música. */
const NIVEL_SISEO = 0.015;
/** Cuánto del ruido anterior se conserva: suaviza el ruido blanco para que no suene a radio. */
const SUAVIZADO_SISEO = 0.6;
const CHASQUIDOS_POR_SEGUNDO = 5;
const NIVEL_CHASQUIDO = 0.35;
/** Un chasquido de polvo dura ~1 ms: después de eso ya sería un golpe. */
const CAIDA_CHASQUIDO = 0.0004;
/** A las 5 caídas el chasquido ya es inaudible (e^-5 < 1 %): ahí se corta. */
const LARGO_EN_CAIDAS = 5;

/** Ráfaga de ruido que se apaga en seco: una mota de polvo bajo la aguja. */
function agregarChasquido(datos: Float32Array, inicio: number, muestreo: number): void {
  // Al cubo: casi todos son leves y de vez en cuando uno se oye claro, como en un disco real
  const fuerza = NIVEL_CHASQUIDO * Math.random() ** 3;
  const caida = CAIDA_CHASQUIDO * muestreo;
  const largo = Math.min(Math.round(caida * LARGO_EN_CAIDAS), datos.length - inicio);
  for (let i = 0; i < largo; i++) {
    const ruido = Math.random() * 2 - 1;
    datos[inicio + i] = (datos[inicio + i] ?? 0) + ruido * fuerza * Math.exp(-i / caida);
  }
}

function llenarCrepitar(datos: Float32Array, muestreo: number): void {
  let anterior = 0;
  for (let i = 0; i < datos.length; i++) {
    const ruido = Math.random() * 2 - 1;
    anterior = anterior * SUAVIZADO_SISEO + ruido * (1 - SUAVIZADO_SISEO);
    datos[i] = anterior * NIVEL_SISEO;
  }
  const cantidad = Math.round((CHASQUIDOS_POR_SEGUNDO * datos.length) / muestreo);
  for (let n = 0; n < cantidad; n++) {
    agregarChasquido(datos, Math.floor(Math.random() * datos.length), muestreo);
  }
}

/**
 * Ruido de superficie generado por código (0 KB de descarga), sonando en loop desde ya en
 * silencio: la ganancia que devuelve lo hace aparecer y desaparecer con la aguja.
 */
export function crearCrepitar(contexto: AudioContext, salida: AudioNode): GainNode {
  const muestreo = contexto.sampleRate;
  const buffer = contexto.createBuffer(1, DURACION_BUCLE * muestreo, muestreo);
  llenarCrepitar(buffer.getChannelData(0), muestreo);
  const fuente = contexto.createBufferSource();
  fuente.buffer = buffer;
  fuente.loop = true;
  const ganancia = contexto.createGain();
  ganancia.gain.value = 0;
  fuente.connect(ganancia).connect(salida);
  fuente.start();
  return ganancia;
}
