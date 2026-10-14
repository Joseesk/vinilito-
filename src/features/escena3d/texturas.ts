import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { crearAleatorio, crearElemento, entre, leerToken } from '../../shared/utils';

export interface Lienzo {
  readonly ancho: number;
  readonly alto: number;
}

export type Pintor = (
  contexto: CanvasRenderingContext2D,
  lienzo: Lienzo,
  azar: () => number,
) => void;

/** Motas por píxel de la pared: suficientes para romper lo liso sin verse "ruidosa". */
const DENSIDAD_MOTAS = 1 / 40;
const CANTIDAD_VETAS = 140;
const PASO_VETA_PX = 6;
const SEMILLA_PARED = 11;
const SEMILLA_NOGAL = 23;

export interface MedidasTextura {
  readonly ancho: number;
  readonly alto: number;
  readonly semilla: number;
}

/** Todo se genera en un canvas: cero descargas (pensado para conexiones lentas). */
export function crearTextura(
  { ancho, alto, semilla }: MedidasTextura,
  pintar: Pintor,
): CanvasTexture {
  const canvas = crearElemento('canvas', {
    atributos: { width: String(ancho), height: String(alto) },
  });
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    throw new Error('Canvas 2D no disponible');
  }
  pintar(contexto, { ancho, alto }, crearAleatorio(semilla));
  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  textura.wrapS = RepeatWrapping;
  textura.wrapT = RepeatWrapping;
  return textura;
}

/** Motas claras y oscuras casi invisibles: yeso en la pared, fibras en el cartón. */
export function pintarMotas(
  contexto: CanvasRenderingContext2D,
  { ancho, alto, densidad }: Lienzo & { readonly densidad: number },
  azar: () => number,
): void {
  const luz = leerToken('--textura-luz');
  const sombra = leerToken('--textura-sombra');
  for (let i = 0; i < ancho * alto * densidad; i++) {
    contexto.fillStyle = azar() < 0.5 ? luz : sombra;
    contexto.fillRect(azar() * ancho, azar() * alto, entre(azar, 1, 3), entre(azar, 1, 3));
  }
}

const pintarPared: Pintor = (contexto, { ancho, alto }, azar) => {
  contexto.fillStyle = leerToken('--estudio-pared');
  contexto.fillRect(0, 0, ancho, alto);
  pintarMotas(contexto, { ancho, alto, densidad: DENSIDAD_MOTAS }, azar);
};

/** Vetas onduladas a lo largo de la tabla, con grosor y opacidad variables. */
const pintarNogal: Pintor = (contexto, { ancho: lado }, azar) => {
  contexto.fillStyle = leerToken('--nogal');
  contexto.fillRect(0, 0, lado, lado);
  contexto.strokeStyle = leerToken('--nogal-veta');
  for (let i = 0; i < CANTIDAD_VETAS; i++) {
    const base = azar() * lado;
    const amplitud = entre(azar, 1, 7);
    const frecuencia = entre(azar, 0.004, 0.02);
    const fase = azar() * Math.PI * 2;
    contexto.globalAlpha = entre(azar, 0.15, 0.6);
    contexto.lineWidth = entre(azar, 0.5, 2.5);
    contexto.beginPath();
    for (let x = 0; x <= lado; x += PASO_VETA_PX) {
      contexto.lineTo(x, base + Math.sin(x * frecuencia + fase) * amplitud);
    }
    contexto.stroke();
  }
  contexto.globalAlpha = 1;
};

/** Mancha oscura difusa: reemplaza a las sombras reales en calidad `baja`. */
const pintarSombraFalsa: Pintor = (contexto, { ancho: lado }) => {
  const centro = lado / 2;
  const degradado = contexto.createRadialGradient(centro, centro, 0, centro, centro, centro);
  degradado.addColorStop(0, leerToken('--sombra-falsa'));
  degradado.addColorStop(1, 'transparent');
  contexto.fillStyle = degradado;
  contexto.fillRect(0, 0, lado, lado);
};

export interface TexturasEstudio {
  readonly pared: CanvasTexture;
  readonly nogal: CanvasTexture;
  readonly sombraFalsa: CanvasTexture;
}

export function crearTexturasEstudio(lado: number): TexturasEstudio {
  return {
    pared: crearTextura({ ancho: lado, alto: lado, semilla: SEMILLA_PARED }, pintarPared),
    nogal: crearTextura({ ancho: lado, alto: lado, semilla: SEMILLA_NOGAL }, pintarNogal),
    sombraFalsa: crearTextura({ ancho: lado / 4, alto: lado / 4, semilla: 0 }, pintarSombraFalsa),
  };
}
