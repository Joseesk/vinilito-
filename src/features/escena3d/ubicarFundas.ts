import { Group } from 'three';
import type { Proyecto } from '../../shared/types/proyecto';
import { crearAleatorio, entre } from '../../shared/utils';
import type { ConfiguracionCalidad } from './calidad';
import { crearFunda3d, MEDIDAS_FUNDA, type MallaFunda } from './crearFunda3d';

/** Aire entre fundas: pegadas pero sin que las caras se mezclen (z-fighting). */
const SEPARACION = 0.0006;
const INCLINACION_ULTIMA = (6 * Math.PI) / 180;
/** Nadie acomoda los discos a la perfección: pequeños giros y desfasajes fijos por semilla. */
const VARIACION_GIRO = 0.01;
const VARIACION_FONDO = 0.004;
const SEMILLA_ACOMODO = 5;

export interface FundaEnRepisa {
  readonly id: string;
  /** Esquina inferior izquierda de la funda, apoyada en la tabla: el giro pivota ahí. */
  readonly pivote: Group;
  readonly malla: MallaFunda;
}

/** Hueco para que la última, inclinada, apoye su esquina superior en la vecina. */
function calcularHueco(cantidad: number): number {
  return cantidad > 1 ? MEDIDAS_FUNDA.lado * Math.sin(INCLINACION_ULTIMA) : 0;
}

function crearPivote(malla: MallaFunda, x: number, azar: () => number): Group {
  const espesor = malla.geometry.parameters.width;
  malla.position.set(espesor / 2, MEDIDAS_FUNDA.lado / 2, 0);
  const pivote = new Group();
  pivote.position.set(x, 0, entre(azar, -VARIACION_FONDO, VARIACION_FONDO));
  pivote.rotation.y = entre(azar, -VARIACION_GIRO, VARIACION_GIRO);
  pivote.add(malla);
  return pivote;
}

/** Fila centrada sobre la tabla (y = 0), de 1 a 10 fundas; la última apoyada en su vecina. */
export function ubicarFundas(
  proyectos: readonly Proyecto[],
  calidad: ConfiguracionCalidad,
): { readonly grupo: Group; readonly fundas: readonly FundaEnRepisa[] } {
  const mallas = proyectos.map((proyecto, indice) => crearFunda3d(proyecto, { indice, calidad }));
  const espesores = mallas.map((malla) => malla.geometry.parameters.width);
  const hueco = calcularHueco(mallas.length);
  const total =
    espesores.reduce((suma, e) => suma + e, 0) + SEPARACION * (mallas.length - 1) + hueco;
  const azar = crearAleatorio(SEMILLA_ACOMODO);
  const grupo = new Group();
  let x = -total / 2;
  const fundas = mallas.map((malla, indice) => {
    const esUltimaInclinada = indice === mallas.length - 1 && mallas.length > 1;
    x += esUltimaInclinada ? hueco : 0;
    const pivote = crearPivote(malla, x, azar);
    pivote.rotation.z = esUltimaInclinada ? INCLINACION_ULTIMA : 0;
    x += (espesores[indice] ?? 0) + SEPARACION;
    grupo.add(pivote);
    return { id: malla.name, pivote, malla };
  });
  return { grupo, fundas };
}
