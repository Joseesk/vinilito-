import {
  Color,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SpotLight,
  type Texture,
} from 'three';
import { PROYECTOS } from '../../data/proyectos';
import { leerToken } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { ubicarCamara, VISTA_GENERAL } from './camara';
import { crearRepisa3d, MEDIDAS_REPISA } from './crearRepisa3d';
import type { Escena3d } from './renderizador';
import { crearRinconTocadiscos, type RinconTocadiscos } from './rinconTocadiscos';
import { crearTexturasEstudio } from './texturas';
import { type FundaEnRepisa, ubicarFundas } from './ubicarFundas';

/** La pared queda apenas detrás del fondo de la repisa (las ménsulas se atornillan ahí). */
const Z_PARED = -MEDIDAS_REPISA.profundidad / 2 - 0.001;
const PARED = { ancho: 6, alto: 4, centroY: 0.4, repeticion: 3 } as const;
/** Spot cálido desde arriba y algo adelante, como una lámpara de techo dirigida. */
const SPOT = { x: 0.15, y: 1.3, z: 0.9, intensidad: 16, angulo: 0.55, penumbra: 0.75 } as const;
const AMBIENTE_INTENSIDAD = 0.7;
const LADO_MAPA_SOMBRAS = 1024;

function crearPared(textura: Texture): Mesh {
  textura.repeat.set(PARED.repeticion, PARED.repeticion);
  const pared = new Mesh(
    new PlaneGeometry(PARED.ancho, PARED.alto),
    new MeshStandardMaterial({ map: textura, roughness: 0.95, metalness: 0 }),
  );
  pared.position.set(0, PARED.centroY, Z_PARED);
  pared.receiveShadow = true;
  return pared;
}

function crearSpot(calidad: ConfiguracionCalidad): SpotLight {
  const spot = new SpotLight(new Color(leerToken('--estudio-luz')), SPOT.intensidad);
  spot.position.set(SPOT.x, SPOT.y, SPOT.z);
  spot.angle = SPOT.angulo;
  spot.penumbra = SPOT.penumbra;
  spot.target.position.set(0, 0.1, Z_PARED);
  spot.castShadow = calidad.sombras;
  spot.shadow.mapSize.set(LADO_MAPA_SOMBRAS, LADO_MAPA_SOMBRAS);
  spot.shadow.normalBias = 0.02;
  return spot;
}

/** Calidad `baja`: una mancha difusa en la pared bajo la tabla imita su sombra. */
function crearSombraFalsa(textura: Texture): Mesh {
  const { largo } = MEDIDAS_REPISA;
  const sombra = new Mesh(
    new PlaneGeometry(largo * 1.3, 0.25),
    new MeshBasicMaterial({ map: textura, transparent: true, depthWrite: false }),
  );
  sombra.position.set(0, -0.09, Z_PARED + 0.001);
  return sombra;
}

export interface LucesEstudio {
  readonly spot: SpotLight;
  readonly ambiente: HemisphereLight;
}

export interface Estudio {
  readonly fundas: readonly FundaEnRepisa[];
  readonly luces: LucesEstudio;
  readonly rincon: RinconTocadiscos;
}

/** Arma la habitación, la luz, la repisa y las fundas; deja la cámara en la vista general. */
export function construirEstudio(
  { escena, camara, entorno }: Escena3d,
  calidad: ConfiguracionCalidad,
): Estudio {
  const texturas = crearTexturasEstudio(calidad.ladoTextura);
  const ambiente = new HemisphereLight(
    new Color(leerToken('--estudio-ambiente')),
    new Color(leerToken('--estudio-pared')),
    AMBIENTE_INTENSIDAD,
  );
  const spot = crearSpot(calidad);
  escena.add(crearPared(texturas.pared), ambiente, spot, spot.target);
  const { grupo, fundas } = ubicarFundas(PROYECTOS, calidad);
  escena.add(crearRepisa3d(texturas.nogal), grupo);
  const rincon = crearRinconTocadiscos(escena, {
    madera: texturas.nogal,
    zPared: Z_PARED,
    entorno,
  });
  if (!calidad.sombras) {
    escena.add(crearSombraFalsa(texturas.sombraFalsa));
  }
  ubicarCamara(camara, VISTA_GENERAL);
  return { fundas, luces: { spot, ambiente }, rincon };
}
