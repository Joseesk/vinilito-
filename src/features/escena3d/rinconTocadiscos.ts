import { Color, Mesh, MeshStandardMaterial, type Scene, SpotLight, type Texture } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { leerToken } from '../../shared/utils';
import { crearTocadiscos, type Tocadiscos } from './crearTocadiscos';

/**
 * Mueble bajo contra la pared, debajo de la repisa: en la vista general queda fuera de
 * cuadro y la cámara baja a buscarlo cuando se abre un disco (Y8).
 */
const MUEBLE = { ancho: 1.2, alto: 0.6, fondo: 0.45, techoY: -0.55, radioCanto: 0.006 } as const;
/** Luz cálida tenue, como una lámpara baja: sin ella el tocadiscos quedaría en negro. */
const LUZ = { x: -0.25, y: 0.1, z: 0.55, intensidad: 5, angulo: 0.5, penumbra: 0.8 } as const;
const REPETICION_VETA = 2;

export interface RinconTocadiscos {
  readonly tocadiscos: Tocadiscos;
  readonly luz: SpotLight;
}

function crearMueble(madera: Texture, zPared: number): Mesh {
  const textura = madera.clone();
  textura.repeat.set(REPETICION_VETA, 1);
  const mueble = new Mesh(
    new RoundedBoxGeometry(MUEBLE.ancho, MUEBLE.alto, MUEBLE.fondo, 3, MUEBLE.radioCanto),
    new MeshStandardMaterial({ map: textura, roughness: 0.55 }),
  );
  mueble.position.set(0, MUEBLE.techoY - MUEBLE.alto / 2, zPared + MUEBLE.fondo / 2);
  mueble.receiveShadow = true;
  return mueble;
}

/** Arma mueble + tocadiscos + luz y los agrega a la escena. */
export function crearRinconTocadiscos(
  escena: Scene,
  {
    madera,
    zPared,
    entorno,
  }: { readonly madera: Texture; readonly zPared: number; readonly entorno: Texture },
): RinconTocadiscos {
  const mueble = crearMueble(madera, zPared);
  const tocadiscos = crearTocadiscos({ madera, entorno });
  tocadiscos.grupo.position.set(0, MUEBLE.techoY, zPared + MUEBLE.fondo / 2);
  const luz = new SpotLight(new Color(leerToken('--estudio-luz-tenue')), LUZ.intensidad);
  luz.position.set(LUZ.x, LUZ.y, LUZ.z);
  luz.angle = LUZ.angulo;
  luz.penumbra = LUZ.penumbra;
  luz.target = tocadiscos.grupo;
  escena.add(mueble, tocadiscos.grupo, luz);
  return { tocadiscos, luz };
}
