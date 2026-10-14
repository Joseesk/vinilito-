import {
  DURACION_APERTURA,
  DURACION_FUNDA,
  EASE_VINILO,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import { escuchar } from '../../shared/eventos';
import { combinarDesconexiones, obtenerElemento } from '../../shared/utils';
import type { PayloadProyecto } from '../../shared/types/eventos';
import { PROPIEDADES_ANIMADAS } from './constantes';
import { buscarLomo, obtenerLomos } from './lomos';

/** El lomo sube un poco y se desvanece mientras la funda (del vinilo) toma su lugar. */
const SUBIDA_LOMO_PORCENTAJE = -15;
const OPACIDAD_ATENUADA = 0.2;

/** Misma duración y ease que la apertura del vinilo: se leen como un solo movimiento. */
function crearSeleccion(escena: HTMLElement, id: string): gsap.core.Timeline | null {
  const elegido = buscarLomo(escena, id);
  if (!elegido) {
    return null;
  }
  // El cartel también se atenúa: con un disco abierto, el resto de la pared es fondo
  const otros = [
    ...obtenerLomos(escena).filter((lomo) => lomo !== elegido),
    obtenerElemento('.cartel', escena),
  ];
  const linea = gsap.timeline({
    defaults: { duration: DURACION_APERTURA, ease: EASE_VINILO },
    onReverseComplete: () => {
      linea.kill();
      gsap.set([elegido, ...otros], { clearProps: PROPIEDADES_ANIMADAS });
    },
  });
  linea.to(otros, { opacity: OPACIDAD_ATENUADA }, 0);
  // Desaparece en la misma duración que gira la funda: se lee como que el lomo "es" la funda
  const salida = prefiereMenosMovimiento()
    ? { opacity: 0 }
    : { yPercent: SUBIDA_LOMO_PORCENTAJE, opacity: 0 };
  linea.to(elegido, { ...salida, duration: DURACION_FUNDA }, 0);
  return linea;
}

/** La escena anima sus propios lomos reaccionando al vinilo. Devuelve la desconexión. */
export function conectarSeleccion(escena: HTMLElement, intro: gsap.core.Timeline): () => void {
  let actual: gsap.core.Timeline | null = null;
  const alAbrir = ({ id }: PayloadProyecto): void => {
    // Click durante la intro: se completa ya, si no su clearProps final borraría la funda
    intro.progress(1);
    // Si quedó una selección a medio revertir, se descarta en su estado inicial
    actual?.progress(0).kill();
    actual = crearSeleccion(escena, id);
  };
  return combinarDesconexiones([
    escuchar('vinilo:abriendo', alAbrir),
    escuchar('vinilo:cerrando', () => {
      actual?.reverse();
    }),
  ]);
}
