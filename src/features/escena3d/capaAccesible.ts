import { type Camera, Vector3 } from 'three';
import { PROYECTOS } from '../../data/proyectos';
import { gsap, prefiereMenosMovimiento } from '../../shared/animacion';
import { emitir, escuchar } from '../../shared/eventos';
import { combinarDesconexiones, crearElemento, devolverFocoSiSePerdio } from '../../shared/utils';
import { proyectarPuntos } from './proyectar';
import type { FundaEnRepisa } from './ubicarFundas';

/** Inclinación al pasar el mouse o enfocar: lo justo para "enganchar" la funda. */
const INCLINACION_HOVER = (9 * Math.PI) / 180;
const DURACION_HOVER = 0.3;

export interface PiezasCapa {
  readonly lienzo: HTMLCanvasElement;
  readonly camara: Camera;
  readonly fundas: readonly FundaEnRepisa[];
  readonly solicitarRender: () => void;
}

/** Las 4 esquinas de la cara del lomo (+z) en coordenadas locales de la malla. */
function esquinasLomo({ malla }: FundaEnRepisa): Vector3[] {
  const { width, height, depth } = malla.geometry.parameters;
  const [x, y, z] = [width / 2, height / 2, depth / 2];
  return [
    new Vector3(-x, -y, z),
    new Vector3(x, -y, z),
    new Vector3(-x, y, z),
    new Vector3(x, y, z),
  ];
}

function crearBoton(funda: FundaEnRepisa): HTMLButtonElement {
  const proyecto = PROYECTOS.find((candidato) => candidato.id === funda.id);
  const boton = crearElemento('button', {
    clases: ['capa3d__funda'],
    atributos: {
      type: 'button',
      'data-id': funda.id,
      'aria-expanded': 'false',
      'aria-label': proyecto ? `${proyecto.numero}. ${proyecto.titulo}` : funda.id,
    },
  });
  boton.addEventListener('click', () => {
    const { left, top, width, height } = boton.getBoundingClientRect();
    emitir('proyecto:seleccionado', {
      id: funda.id,
      origen: { x: left, y: top, ancho: width, alto: height },
    });
  });
  return boton;
}

function conectarInclinacion(
  boton: HTMLButtonElement,
  funda: FundaEnRepisa,
  render: () => void,
): void {
  const inclinar = (angulo: number): void => {
    gsap.to(funda.inclinador.rotation, {
      x: angulo,
      duration: prefiereMenosMovimiento() ? 0 : DURACION_HOVER,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: render,
    });
  };
  boton.addEventListener('pointerenter', () => inclinar(INCLINACION_HOVER));
  boton.addEventListener('focus', () => inclinar(INCLINACION_HOVER));
  boton.addEventListener('pointerleave', () => inclinar(0));
  boton.addEventListener('blur', () => inclinar(0));
}

function conectarEstado(botones: readonly HTMLButtonElement[]): () => void {
  const buscar = (id: string): HTMLButtonElement | undefined =>
    botones.find((boton) => boton.dataset['id'] === id);
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', ({ id }) => buscar(id)?.setAttribute('aria-expanded', 'true')),
    escuchar('vinilo:cerrado', ({ id }) => {
      const boton = buscar(id);
      boton?.setAttribute('aria-expanded', 'false');
      if (boton) {
        devolverFocoSiSePerdio(boton);
      }
    }),
  ]);
}

/**
 * Un `<button>` transparente por funda, alineado con su proyección en pantalla: teclado,
 * foco, lectores de pantalla y clicks funcionan como DOM normal, sin raycasting.
 */
export function crearCapaAccesible(piezas: PiezasCapa): {
  readonly nav: HTMLElement;
  readonly ubicar: () => void;
} {
  const botones = piezas.fundas.map((funda) => {
    const boton = crearBoton(funda);
    conectarInclinacion(boton, funda, piezas.solicitarRender);
    return boton;
  });
  const nav = crearElemento('nav', {
    clases: ['capa3d'],
    atributos: { 'aria-label': 'Proyectos' },
    hijos: botones,
  });
  const esquinas = piezas.fundas.map(esquinasLomo);
  const ubicar = (): void => {
    piezas.fundas.forEach((funda, indice) => {
      const { x, y, ancho, alto } = proyectarPuntos(esquinas[indice] ?? [], funda.malla, piezas);
      Object.assign(botones[indice]?.style ?? {}, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${ancho}px`,
        height: `${alto}px`,
      });
    });
  };
  conectarEstado(botones);
  return { nav, ubicar };
}
