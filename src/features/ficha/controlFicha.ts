import { PROYECTOS } from '../../data/proyectos';
import { DURACION_FICHA, EASE_ENTRADA, RETRASO_FICHA, gsap } from '../../shared/animacion';
import { escuchar } from '../../shared/eventos';
import { conectarCierre } from './cerrarFicha';
import { crearFicha } from './crearFicha';

const ENTRADA_FICHA_PORCENTAJE = 12;

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
      { autoAlpha: 0, xPercent: ENTRADA_FICHA_PORCENTAJE },
      {
        autoAlpha: 1,
        xPercent: 0,
        duration: DURACION_FICHA,
        delay: RETRASO_FICHA,
        ease: EASE_ENTRADA,
        onReverseComplete: () => this.quitar(),
      },
    );
    this.abierta = { elemento, entrada, desconectarCierre: conectarCierre(elemento) };
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
  const desconectar = [
    escuchar('vinilo:abriendo', ({ id }) => control.mostrar(id)),
    escuchar('vinilo:cerrando', () => control.ocultar()),
  ];
  return () => desconectar.forEach((dejarDeEscuchar) => dejarDeEscuchar());
}
