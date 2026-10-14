import { BoxGeometry, type Material, Mesh, MeshStandardMaterial } from 'three';
import type { Proyecto } from '../../shared/types/proyecto';
import { leerToken } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { crearTexturasFunda } from './texturasFunda';

/**
 * Metros. El lado es el de un LP real (31.4 cm); el lomo real mide ~3 mm, acá se engrosa
 * para que el título se lea y el lomo se pueda clickear.
 */
export const MEDIDAS_FUNDA = { lado: 0.314, espesor: 0.026, espesorDoble: 0.034 } as const;
const RUGOSIDAD_CARTON = 0.85;

/** Mismo patrón que `.lomo:nth-child(3n + 2)` de la versión CSS: discos 2, 5, 8 son dobles. */
export function esDoble(indice: number): boolean {
  return indice % 3 === 1;
}

export type MallaFunda = Mesh<BoxGeometry, Material[]>;

/**
 * Caja: x = espesor (lomo), y = alto, z = fondo. Caras de BoxGeometry en orden
 * +x, -x, +y, -y, +z, -z → portadas a los costados, lomo mirando a la cámara (+z).
 */
export function crearFunda3d(
  proyecto: Proyecto,
  { indice, calidad }: { readonly indice: number; readonly calidad: ConfiguracionCalidad },
): MallaFunda {
  const { lado } = MEDIDAS_FUNDA;
  const espesor = esDoble(indice) ? MEDIDAS_FUNDA.espesorDoble : MEDIDAS_FUNDA.espesor;
  const { lomo, portada } = crearTexturasFunda(proyecto, {
    ladoTextura: calidad.ladoTextura,
    proporcionLomo: espesor / lado,
  });
  const conMapa = (mapa: typeof lomo): MeshStandardMaterial =>
    new MeshStandardMaterial({ map: mapa, roughness: RUGOSIDAD_CARTON });
  const canto = new MeshStandardMaterial({
    color: leerToken(`--${proyecto.color}`),
    roughness: RUGOSIDAD_CARTON,
  });
  const caraPortada = conMapa(portada);
  const malla: MallaFunda = new Mesh(new BoxGeometry(espesor, lado, lado), [
    caraPortada,
    caraPortada,
    canto,
    canto,
    conMapa(lomo),
    canto,
  ]);
  malla.name = proyecto.id;
  malla.castShadow = calidad.sombras;
  malla.receiveShadow = calidad.sombras;
  return malla;
}
