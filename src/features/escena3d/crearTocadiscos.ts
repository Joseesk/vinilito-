import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Texture,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { leerToken } from '../../shared/utils';

/** Metros, medidas de un tocadiscos de mesa típico. */
const BASE = { ancho: 0.45, alto: 0.11, fondo: 0.35, radioCanto: 0.008 } as const;
const PLATO = { radio: 0.15, alto: 0.02, x: -0.04 } as const;
const FIELTRO = { radio: 0.148, alto: 0.003 } as const;
/** Sobresale ~7 mm sobre el disco apoyado, como uno real. */
const EJE = { radio: 0.0035, alto: 0.012 } as const;
const BRAZO = {
  x: 0.17,
  z: -0.11,
  radioBase: 0.025,
  altoPoste: 0.04,
  largo: 0.23,
  radioTubo: 0.004,
} as const;
const SEGMENTOS = 64;

/** Partes que se animan en Y9: el plato gira y el brazo se mueve hasta el disco. */
export interface Tocadiscos {
  readonly grupo: Group;
  /** Centro de la cara superior del fieltro (donde se apoya el disco), en coords del grupo. */
  readonly alturaApoyo: number;
  readonly centroPlato: { readonly x: number; readonly z: number };
  readonly plato: Group;
  /** Gira en y (va del reposo al disco) y en x (sube y baja la aguja). */
  readonly brazo: Group;
}

/** Intensidad de los reflejos del entorno sobre el metal (bajo: cuarto en penumbra). */
const REFLEJO_METAL = 0.6;

export interface TexturasTocadiscos {
  readonly madera: Texture;
  readonly entorno: Texture;
}

function crearMateriales({
  madera,
  entorno,
}: TexturasTocadiscos): Record<'madera' | 'metal' | 'fieltro', MeshStandardMaterial> {
  return {
    madera: new MeshStandardMaterial({ map: madera, roughness: 0.5 }),
    metal: new MeshStandardMaterial({
      color: leerToken('--metal-plateado'),
      metalness: 0.9,
      roughness: 0.3,
      envMap: entorno,
      envMapIntensity: REFLEJO_METAL,
    }),
    fieltro: new MeshStandardMaterial({ color: leerToken('--fieltro'), roughness: 1 }),
  };
}

function crearPlato(metal: MeshStandardMaterial, fieltro: MeshStandardMaterial): Group {
  const plato = new Group();
  const disco = new Mesh(
    new CylinderGeometry(PLATO.radio, PLATO.radio, PLATO.alto, SEGMENTOS),
    metal,
  );
  disco.position.y = PLATO.alto / 2;
  const alfombra = new Mesh(
    new CylinderGeometry(FIELTRO.radio, FIELTRO.radio, FIELTRO.alto, SEGMENTOS),
    fieltro,
  );
  alfombra.position.y = PLATO.alto + FIELTRO.alto / 2;
  const eje = new Mesh(new CylinderGeometry(EJE.radio, EJE.radio, EJE.alto, 16), metal);
  eje.position.y = PLATO.alto + EJE.alto / 2;
  plato.add(disco, alfombra, eje);
  plato.position.set(PLATO.x, BASE.alto, 0);
  return plato;
}

/** Brazo en reposo, paralelo al lado derecho y apuntando hacia adelante (+z). */
function crearBrazo(metal: MeshStandardMaterial): {
  readonly brazo: Group;
  readonly giratorio: Group;
} {
  const base = new Mesh(new CylinderGeometry(BRAZO.radioBase, BRAZO.radioBase, 0.012, 32), metal);
  const poste = new Mesh(new CylinderGeometry(0.006, 0.006, BRAZO.altoPoste, 16), metal);
  poste.position.y = BRAZO.altoPoste / 2;
  const tubo = new Mesh(
    new CylinderGeometry(BRAZO.radioTubo, BRAZO.radioTubo, BRAZO.largo, 16),
    metal,
  );
  tubo.rotation.x = Math.PI / 2;
  tubo.position.z = BRAZO.largo / 2;
  const capsula = new Mesh(new BoxGeometry(0.018, 0.008, 0.03), metal);
  capsula.position.set(0, -0.004, BRAZO.largo + 0.01);
  const contrapeso = new Mesh(new CylinderGeometry(0.013, 0.013, 0.03, 24), metal);
  contrapeso.rotation.x = Math.PI / 2;
  contrapeso.position.z = -0.04;
  const giratorio = new Group();
  giratorio.position.y = BRAZO.altoPoste;
  giratorio.add(tubo, capsula, contrapeso);
  const brazo = new Group();
  brazo.add(base, poste, giratorio);
  brazo.position.set(BRAZO.x, BASE.alto, BRAZO.z);
  return { brazo, giratorio };
}

export function crearTocadiscos(texturas: TexturasTocadiscos): Tocadiscos {
  const materiales = crearMateriales(texturas);
  const base = new Mesh(
    new RoundedBoxGeometry(BASE.ancho, BASE.alto, BASE.fondo, 3, BASE.radioCanto),
    materiales.madera,
  );
  base.position.y = BASE.alto / 2;
  const plato = crearPlato(materiales.metal, materiales.fieltro);
  const { brazo, giratorio } = crearBrazo(materiales.metal);
  const grupo = new Group();
  grupo.add(base, plato, brazo);
  grupo.traverse((parte) => {
    parte.castShadow = true;
    parte.receiveShadow = true;
  });
  return {
    grupo,
    alturaApoyo: BASE.alto + PLATO.alto + FIELTRO.alto,
    centroPlato: { x: PLATO.x, z: 0 },
    plato,
    brazo: giratorio,
  };
}
