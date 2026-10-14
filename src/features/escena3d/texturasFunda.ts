import type { CanvasTexture } from 'three';
import type { Proyecto } from '../../shared/types/proyecto';
import { entre, leerToken } from '../../shared/utils';
import { crearTextura, type Lienzo, pintarMotas, type Pintor } from './texturas';

const DENSIDAD_CARTON = 1 / 25;
/** Desgaste por borde (cartón que blanquea): puntos por px de perímetro. */
const DENSIDAD_GASTADO = 0.5;
const ANCHO_PLIEGUE_PX = 1.5;

interface Impresion {
  readonly color: string;
  readonly numero: string;
  readonly titulo: string;
}

function fuente(token: string, peso: string, tamanio: number): string {
  return `${peso} ${Math.round(tamanio)}px ${leerToken(token)}`;
}

/** Bordes que blanquean donde el cartón se roza al sacar y meter el disco. */
function pintarGastado(
  contexto: CanvasRenderingContext2D,
  lienzo: Lienzo,
  azar: () => number,
): void {
  const { ancho, alto } = lienzo;
  contexto.fillStyle = leerToken('--carton-gastado');
  for (let i = 0; i < (ancho + alto) * 2 * DENSIDAD_GASTADO; i++) {
    const enVertical = azar() < alto / (ancho + alto);
    const borde = entre(azar, 0, 3);
    const x = enVertical ? (azar() < 0.5 ? borde : ancho - borde) : azar() * ancho;
    const y = enVertical ? azar() * alto : azar() < 0.5 ? borde : alto - borde;
    contexto.fillRect(x, y, entre(azar, 0.5, 2), entre(azar, 0.5, 2));
  }
}

function pintarCarton(
  contexto: CanvasRenderingContext2D,
  { ancho, alto, color }: Lienzo & { readonly color: string },
  azar: () => number,
): void {
  contexto.fillStyle = color;
  contexto.fillRect(0, 0, ancho, alto);
  pintarMotas(contexto, { ancho, alto, densidad: DENSIDAD_CARTON }, azar);
}

function pintorLomo({ color, numero, titulo }: Impresion): Pintor {
  return (contexto, lienzo, azar) => {
    const { ancho, alto } = lienzo;
    pintarCarton(contexto, { ...lienzo, color }, azar);
    // Pliegues: donde el cartón dobla hacia las portadas queda una línea más clara
    contexto.fillStyle = leerToken('--carton-pliegue');
    contexto.fillRect(ancho * 0.07, 0, ANCHO_PLIEGUE_PX, alto);
    contexto.fillRect(ancho * 0.93 - ANCHO_PLIEGUE_PX, 0, ANCHO_PLIEGUE_PX, alto);
    contexto.fillStyle = leerToken('--tinta');
    contexto.textAlign = 'center';
    contexto.textBaseline = 'top';
    contexto.font = fuente('--fuente-titulo', '400', ancho * 0.5);
    contexto.fillText(numero, ancho / 2, alto * 0.025);
    // Título de arriba hacia abajo, como los lomos de discos
    contexto.save();
    contexto.translate(ancho / 2, alto * 0.13);
    contexto.rotate(Math.PI / 2);
    contexto.textAlign = 'left';
    contexto.textBaseline = 'middle';
    contexto.font = fuente('--fuente-texto', '500', ancho * 0.4);
    contexto.fillText(titulo.toUpperCase(), 0, 0, alto * 0.82);
    contexto.restore();
    pintarGastado(contexto, lienzo, azar);
  };
}

function pintorPortada({ color, numero, titulo }: Impresion): Pintor {
  return (contexto, lienzo, azar) => {
    const { ancho: lado } = lienzo;
    pintarCarton(contexto, { ...lienzo, color }, azar);
    // Ring wear: el disco de adentro marca un círculo apenas más claro en el cartón
    contexto.strokeStyle = leerToken('--carton-anillo');
    contexto.lineWidth = lado * 0.035;
    contexto.beginPath();
    contexto.arc(lado / 2, lado / 2, lado * 0.43, 0, Math.PI * 2);
    contexto.stroke();
    contexto.fillStyle = leerToken('--tinta');
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.font = fuente('--fuente-titulo', '400', lado * 0.45);
    contexto.fillText(numero, lado / 2, lado * 0.47);
    contexto.textAlign = 'left';
    contexto.textBaseline = 'bottom';
    contexto.font = fuente('--fuente-texto', '500', lado * 0.05);
    contexto.fillText(titulo.toUpperCase(), lado * 0.07, lado * 0.93, lado * 0.86);
    pintarGastado(contexto, lienzo, azar);
  };
}

export interface TexturasFunda {
  readonly lomo: CanvasTexture;
  readonly portada: CanvasTexture;
}

/**
 * La portada real (imagen) se carga recién al abrir el disco; esta es la impresa de base.
 * `proporcionLomo` = espesor / alto de la funda: el canvas del lomo tiene esa misma forma
 * para que el texto no salga estirado ni comprimido.
 */
export function crearTexturasFunda(
  proyecto: Proyecto,
  {
    ladoTextura,
    proporcionLomo,
  }: { readonly ladoTextura: number; readonly proporcionLomo: number },
): TexturasFunda {
  const impresion: Impresion = {
    color: leerToken(`--${proyecto.color}`),
    numero: String(proyecto.numero),
    titulo: proyecto.titulo,
  };
  const ladoPortada = ladoTextura / 2;
  return {
    lomo: crearTextura(
      {
        ancho: Math.round(ladoTextura * proporcionLomo),
        alto: ladoTextura,
        semilla: proyecto.numero * 7,
      },
      pintorLomo(impresion),
    ),
    portada: crearTextura(
      { ancho: ladoPortada, alto: ladoPortada, semilla: proyecto.numero * 13 },
      pintorPortada(impresion),
    ),
  };
}
