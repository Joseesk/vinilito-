import { CylinderGeometry, Mesh, MeshStandardMaterial, type Texture } from 'three';
import type { Proyecto } from '../../shared/types/proyecto';
import { entre, leerToken } from '../../shared/utils';
import { crearTextura, type Pintor } from './texturas';

/** Metros: LP de 30 cm, ~2 mm de espesor. */
export const MEDIDAS_DISCO = { radio: 0.15, espesor: 0.002 } as const;
const SEGMENTOS = 96;
/** Proporciones sobre el radio de la textura (como en un disco real). */
const RADIO_ETIQUETA = 0.33;
const RADIO_AGUJERO = 0.024;
const INICIO_SURCOS = 0.4;
const FIN_SURCOS = 0.97;
/** Pausas entre temas: bandas lisas que se ven como anillos más oscuros. */
const PAUSAS = [0.52, 0.63, 0.75, 0.86] as const;
const ANCHO_PAUSA = 0.006;
const SURCOS_POR_PX = 0.6;
/** Reflejo del entorno sobre la cara: el brillo que corre por los surcos. */
const REFLEJO_VINILO = 0.25;

function pintarSurcos(contexto: CanvasRenderingContext2D, radio: number, azar: () => number): void {
  const claro = leerToken('--surco-claro');
  const oscuro = leerToken('--surco-oscuro');
  const cantidad = Math.round(radio * (FIN_SURCOS - INICIO_SURCOS) * SURCOS_POR_PX);
  contexto.lineWidth = 1;
  for (let i = 0; i < cantidad; i++) {
    const fraccion = INICIO_SURCOS + ((FIN_SURCOS - INICIO_SURCOS) * i) / cantidad;
    const esPausa = PAUSAS.some((pausa) => Math.abs(fraccion - pausa) < ANCHO_PAUSA);
    contexto.strokeStyle = esPausa ? oscuro : azar() < 0.5 ? claro : oscuro;
    contexto.globalAlpha = esPausa ? 1 : entre(azar, 0.4, 0.9);
    contexto.beginPath();
    contexto.arc(radio, radio, fraccion * radio, 0, Math.PI * 2);
    contexto.stroke();
  }
  contexto.globalAlpha = 1;
}

function pintorDisco(proyecto: Proyecto): Pintor {
  return (contexto, { ancho }, azar) => {
    const radio = ancho / 2;
    contexto.fillStyle = leerToken('--vinyl');
    contexto.fillRect(0, 0, ancho, ancho);
    pintarSurcos(contexto, radio, azar);
    contexto.fillStyle = leerToken(`--${proyecto.color}`);
    contexto.beginPath();
    contexto.arc(radio, radio, radio * RADIO_ETIQUETA, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = leerToken('--tinta');
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.font = `400 ${Math.round(radio * 0.12)}px ${leerToken('--fuente-titulo')}`;
    contexto.fillText(String(proyecto.numero), radio, radio * 0.82);
    contexto.font = `500 ${Math.round(radio * 0.035)}px ${leerToken('--fuente-texto')}`;
    contexto.fillText(proyecto.titulo.toUpperCase(), radio, radio * 1.16, radio * 0.5);
    contexto.fillStyle = leerToken('--surco-oscuro');
    contexto.beginPath();
    contexto.arc(radio, radio, radio * RADIO_AGUJERO, 0, Math.PI * 2);
    contexto.fill();
  };
}

/**
 * Disco del proyecto: cilindro finito con la textura en las dos caras; el brillo de los
 * surcos viene del entorno de reflejos.
 */
export function crearDisco3d(
  proyecto: Proyecto,
  { ladoTextura, entorno }: { readonly ladoTextura: number; readonly entorno: Texture },
): Mesh {
  const textura = crearTextura(
    { ancho: ladoTextura, alto: ladoTextura, semilla: proyecto.numero * 31 },
    pintorDisco(proyecto),
  );
  const cara = new MeshStandardMaterial({
    map: textura,
    // Más rugoso que un vinilo real: inclinado, el spot lo dejaba entero color crema
    roughness: 0.6,
    metalness: 0,
    envMap: entorno,
    envMapIntensity: REFLEJO_VINILO,
  });
  const canto = new MeshStandardMaterial({ color: leerToken('--vinyl'), roughness: 0.4 });
  const disco = new Mesh(
    new CylinderGeometry(
      MEDIDAS_DISCO.radio,
      MEDIDAS_DISCO.radio,
      MEDIDAS_DISCO.espesor,
      SEGMENTOS,
    ),
    [canto, cara, cara],
  );
  disco.name = `disco-${proyecto.id}`;
  return disco;
}
