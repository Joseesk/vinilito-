import { BoxGeometry, Group, Mesh, MeshStandardMaterial, type Texture } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { leerToken } from '../../shared/utils';

/** Medidas en metros: la repisa entra 10 discos con aire a los lados. */
export const MEDIDAS_REPISA = {
  largo: 0.9,
  profundidad: 0.26,
  grosor: 0.032,
} as const;

const RADIO_CANTO = 0.004;
const SEGMENTOS_CANTO = 3;
/** Repeticiones de la textura de nogal a lo largo de la tabla (vetas largas, no estiradas). */
const REPETICION_VETA = 2;
const MENSULA = { ancho: 0.018, alto: 0.16, grosorChapa: 0.005, separacion: 0.32 } as const;

function crearTabla(nogal: Texture): Mesh {
  const { largo, profundidad, grosor } = MEDIDAS_REPISA;
  const textura = nogal.clone();
  textura.repeat.set(REPETICION_VETA, 1);
  // Canto redondeado: atrapa la luz del spot y delata el grosor de la madera
  const tabla = new Mesh(
    new RoundedBoxGeometry(largo, grosor, profundidad, SEGMENTOS_CANTO, RADIO_CANTO),
    new MeshStandardMaterial({ map: textura, roughness: 0.55, metalness: 0 }),
  );
  tabla.position.set(0, -grosor / 2, 0);
  tabla.castShadow = true;
  tabla.receiveShadow = true;
  return tabla;
}

/** Ménsula en L de metal oscuro: chapa contra la pared + brazo bajo la tabla. */
function crearMensula(material: MeshStandardMaterial, x: number): Group {
  const { profundidad, grosor } = MEDIDAS_REPISA;
  const { ancho, alto, grosorChapa } = MENSULA;
  const chapa = new Mesh(new BoxGeometry(ancho, alto, grosorChapa), material);
  chapa.position.set(x, -grosor - alto / 2, -profundidad / 2 + grosorChapa / 2);
  const brazo = new Mesh(new BoxGeometry(ancho, grosorChapa, profundidad * 0.85), material);
  brazo.position.set(x, -grosor - grosorChapa / 2, -profundidad * 0.075);
  const mensula = new Group();
  mensula.add(chapa, brazo);
  mensula.traverse((parte) => {
    parte.castShadow = true;
  });
  return mensula;
}

/** La cara superior de la tabla queda en y = 0: los discos se apoyan ahí. */
export function crearRepisa3d(nogal: Texture): Group {
  const metal = new MeshStandardMaterial({
    color: leerToken('--metal-oscuro'),
    roughness: 0.45,
    metalness: 0.8,
  });
  const repisa = new Group();
  repisa.add(
    crearTabla(nogal),
    crearMensula(metal, -MENSULA.separacion),
    crearMensula(metal, MENSULA.separacion),
  );
  return repisa;
}
