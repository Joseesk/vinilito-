import { type Camera, Vector3 } from 'three';
import { PROYECTOS } from '../../data/proyectos';
import { gsap, prefiereMenosMovimiento } from '../../shared/animacion';
import { emitir, escuchar } from '../../shared/eventos';
import {
  combinarDesconexiones,
  crearElemento,
  devolverFocoSiSePerdio,
  medirElemento,
} from '../../shared/utils';
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
    emitir('proyecto:seleccionado', { id: funda.id, origen: medirElemento(boton) });
  });
  return boton;
}

interface Hover {
  readonly render: () => void;
  /** Mientras hay un disco abierto la animación es dueña de la inclinación. */
  readonly estaBloqueado: () => boolean;
}

function inclinar(funda: FundaEnRepisa, angulo: number, render: () => void): void {
  gsap.to(funda.inclinador.rotation, {
    x: angulo,
    duration: prefiereMenosMovimiento() ? 0 : DURACION_HOVER,
    ease: 'power2.out',
    overwrite: true,
    onUpdate: render,
  });
}

function conectarInclinacion(boton: HTMLButtonElement, funda: FundaEnRepisa, hover: Hover): void {
  const alEntrar = (): void => {
    if (!hover.estaBloqueado()) {
      inclinar(funda, INCLINACION_HOVER, hover.render);
    }
  };
  const alSalir = (): void => {
    if (!hover.estaBloqueado()) {
      inclinar(funda, 0, hover.render);
    }
  };
  boton.addEventListener('pointerenter', alEntrar);
  boton.addEventListener('focus', alEntrar);
  boton.addEventListener('pointerleave', alSalir);
  boton.addEventListener('blur', alSalir);
}

interface EstadoCapa {
  readonly botones: readonly HTMLButtonElement[];
  readonly fundas: readonly FundaEnRepisa[];
  readonly render: () => void;
  readonly bloquear: (valor: boolean) => void;
}

function conectarEstado({ botones, fundas, render, bloquear }: EstadoCapa): () => void {
  const indice = (id: string): number => fundas.findIndex((funda) => funda.id === id);
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', ({ id }) => {
      bloquear(true);
      botones[indice(id)]?.setAttribute('aria-expanded', 'true');
    }),
    escuchar('vinilo:cerrado', ({ id }) => {
      bloquear(false);
      const [boton, funda] = [botones[indice(id)], fundas[indice(id)]];
      if (!boton || !funda) {
        return;
      }
      boton.setAttribute('aria-expanded', 'false');
      // Vuelve derecha a la fila; si el foco regresa a su botón, el `focus` la vuelve a inclinar
      inclinar(funda, 0, render);
      devolverFocoSiSePerdio(boton);
    }),
  ]);
}

function ubicarBotones(botones: readonly HTMLButtonElement[], piezas: PiezasCapa): () => void {
  const esquinas = piezas.fundas.map(esquinasLomo);
  return () => {
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
}

/**
 * Un `<button>` transparente por funda, alineado con su proyección en pantalla: teclado,
 * foco, lectores de pantalla y clicks funcionan como DOM normal, sin raycasting.
 */
export function crearCapaAccesible(piezas: PiezasCapa): {
  readonly nav: HTMLElement;
  readonly ubicar: () => void;
} {
  let bloqueado = false;
  const hover: Hover = { render: piezas.solicitarRender, estaBloqueado: () => bloqueado };
  const botones = piezas.fundas.map((funda) => {
    const boton = crearBoton(funda);
    conectarInclinacion(boton, funda, hover);
    return boton;
  });
  const nav = crearElemento('nav', {
    clases: ['capa3d'],
    atributos: { 'aria-label': 'Proyectos' },
    hijos: botones,
  });
  conectarEstado({
    botones,
    fundas: piezas.fundas,
    render: piezas.solicitarRender,
    bloquear: (valor) => {
      bloqueado = valor;
      // Con la cámara en otra vista los botones quedan sobre otra cosa: sin clicks hasta volver
      nav.classList.toggle('capa3d--bloqueada', valor);
    },
  });
  return { nav, ubicar: ubicarBotones(botones, piezas) };
}
