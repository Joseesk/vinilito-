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

interface FichaAbierta {
  readonly elemento: HTMLElement;
  readonly entrada: gsap.core.Tween;
  readonly desconectarCierre: () => void;
}

class ControlFicha {
  private readonly contenedor: HTMLElement;
  private abierta: FichaAbierta | null = null;

  constructor(contenedor: HTMLElement) {
    this.contenedor = contenedor;
  }

  /** Entra en `vinilo:abriendo` con retraso: aparece mientras el disco termina de salir. */
  mostrar(id: string): void {
    this.quitar();
    const proyecto = PROYECTOS.find((candidato) => candidato.id === id);
    if (!proyecto) {
      return;
    }
    const elemento = crearFicha(proyecto);
    this.contenedor.append(elemento);
    const entrada = gsap.fromTo(
      elemento,
      { autoAlpha: 0, ...obtenerDesplazamientoInicial() },
      {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        duration: DURACION_FICHA,
        delay: RETRASO_FICHA,
        ease: EASE_ENTRADA,
        onReverseComplete: () => this.quitar(),
      },
    );
    this.abierta = { elemento, entrada, desconectarCierre: conectarCierre(elemento) };
  }

  /** Al terminar la apertura: lectores de pantalla anuncian el título y Tab sigue dentro. */
  enfocar(): void {
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
    escuchar('vinilo:abriendo', ({ id }) => control.mostrar(id)),
    escuchar('vinilo:abierto', () => control.enfocar()),
    escuchar('vinilo:cerrando', () => control.ocultar()),
  ]);
}
