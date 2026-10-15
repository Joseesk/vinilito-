import { PROYECTOS } from '../../data/proyectos';
import {
  DURACION_FICHA,
  EASE_ENTRADA,
  RETRASO_FICHA,
  esMovil,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import { escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import { conectarCierre } from './cerrarFicha';
import { crearFicha } from './crearFicha';

const ENTRADA_FICHA_PORCENTAJE = 12;

/** Escritorio: entra desde la derecha. Móvil: desde abajo, donde está la ficha. */
function obtenerDesplazamientoInicial(): gsap.TweenVars {
  if (prefiereMenosMovimiento()) {
    return {};
  }
  return esMovil()
    ? { yPercent: ENTRADA_FICHA_PORCENTAJE }
    : { xPercent: ENTRADA_FICHA_PORCENTAJE };
}

/**
 * `css`: entra en `vinilo:abriendo` con retraso (el disco CSS sale en 1 s).
 * `3d`: entra en `vinilo:abierto`, cuando el disco ya gira (la apertura 3D dura ~3 s y
 * con la ficha encima desde el principio se tapaba el viaje al tocadiscos).
 */
type ModoFicha = 'css' | '3d';

interface FichaAbierta {
  readonly elemento: HTMLElement;
  readonly entrada: gsap.core.Tween;
  readonly desconectarCierre: () => void;
}

class ControlFicha {
  private readonly contenedor: HTMLElement;
  private abierta: FichaAbierta | null = null;
  private modo: ModoFicha = 'css';

  constructor(contenedor: HTMLElement) {
    this.contenedor = contenedor;
  }

  usar3d(): void {
    this.modo = '3d';
  }

  alAbrirse(id: string): void {
    if (this.modo === 'css') {
      this.mostrar(id, RETRASO_FICHA);
    }
  }

  alQuedarAbierto(id: string): void {
    if (this.modo === '3d') {
      this.mostrar(id, 0);
    }
    this.enfocar();
  }

  private mostrar(id: string, retraso: number): void {
    this.quitar();
    const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
    if (!proyecto) {
      return;
    }
    const elemento = crearFicha(proyecto);
    // En el estudio 3D la ficha es una tarjeta impresa ("liner notes"), no un bloque neobrutal
    if (this.modo === '3d') {
      elemento.classList.add('ficha--impresa');
      elemento.querySelectorAll('.boton').forEach((boton) => boton.classList.add('boton--texto'));
    }
    this.contenedor.append(elemento);
    // Visible ya (sincrónico) y después solo se anima la opacidad: con `visibility: hidden`
    // (CSS o `autoAlpha` en 0) el navegador no deja enfocarla al quedar abierto el disco
    gsap.set(elemento, { visibility: 'visible' });
    const entrada = gsap.fromTo(
      elemento,
      { opacity: 0, ...obtenerDesplazamientoInicial() },
      {
        opacity: 1,
        xPercent: 0,
        yPercent: 0,
        duration: DURACION_FICHA,
        delay: retraso,
        ease: EASE_ENTRADA,
        onReverseComplete: () => this.quitar(),
      },
    );
    this.abierta = { elemento, entrada, desconectarCierre: conectarCierre(elemento) };
  }

  /** Al terminar la apertura: lectores de pantalla anuncian el título y Tab sigue dentro. */
  private enfocar(): void {
    this.abierta?.elemento.focus();
  }

  ocultar(): void {
    if (!this.abierta) {
      return;
    }
    this.abierta.desconectarCierre();
    // Si aún no empezó (está en su retraso), reverse() no dispararía onReverseComplete
    if (this.abierta.entrada.time() === 0) {
      this.quitar();
      return;
    }
    this.abierta.entrada.reverse();
  }

  private quitar(): void {
    if (!this.abierta) {
      return;
    }
    this.abierta.desconectarCierre();
    this.abierta.entrada.kill();
    this.abierta.elemento.remove();
    this.abierta = null;
  }
}

/** Devuelve la función que desconecta los listeners. */
export function conectarFicha(contenedor: HTMLElement): () => void {
  const control = new ControlFicha(contenedor);
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', ({ id }) => control.alAbrirse(id)),
    escuchar('vinilo:abierto', ({ id }) => control.alQuedarAbierto(id)),
    escuchar('vinilo:cerrando', () => control.ocultar()),
    escuchar('escena3d:lista', () => control.usar3d()),
  ]);
}
