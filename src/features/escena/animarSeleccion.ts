import {
  DURACION_APERTURA,
  EASE_VINILO,
  esMovil,
  gsap,
  prefiereMenosMovimiento,
} from '../../shared/animacion';
import { escuchar } from '../../shared/eventos';
import { combinarDesconexiones } from '../../shared/utils';
import type { PayloadProyecto } from '../../shared/types/eventos';
import { PROPIEDADES_ANIMADAS, SELECTOR_CARAS } from './constantes';
import { buscarLomo, obtenerLomos } from './lomos';

const SALIDA_FUNDA_PORCENTAJE = -18;
const AVANCE_FUNDA_PX = 60;
/** En móvil el lomo está acostado: la funda sale hacia la derecha. */
const SALIDA_FUNDA_MOVIL_PORCENTAJE = 8;
const OPACIDAD_ATENUADA = 0.2;

function obtenerCarasDeOtros(lomos: readonly HTMLElement[], elegido: HTMLElement): HTMLElement[] {
  return lomos
    .filter((lomo) => lomo !== elegido)
    .flatMap((lomo) => [...lomo.querySelectorAll<HTMLElement>(SELECTOR_CARAS)]);
}

/** Misma duración y ease que el disco: funda y vinilo se leen como un solo movimiento. */
function crearSeleccion(escena: HTMLElement, id: string): gsap.core.Timeline | null {
  const elegido = buscarLomo(escena, id);
  if (!elegido) {
    return null;
  }
  const carasOtros = obtenerCarasDeOtros(obtenerLomos(escena), elegido);
  const linea = gsap.timeline({
    defaults: { duration: DURACION_APERTURA, ease: EASE_VINILO },
    onReverseComplete: () => {
      linea.kill();
      gsap.set([elegido, ...carasOtros], { clearProps: PROPIEDADES_ANIMADAS });
    },
  });
  linea.to(carasOtros, { opacity: OPACIDAD_ATENUADA }, 0);
  if (!prefiereMenosMovimiento()) {
    const salida = esMovil()
      ? { xPercent: SALIDA_FUNDA_MOVIL_PORCENTAJE }
      : { yPercent: SALIDA_FUNDA_PORCENTAJE, z: AVANCE_FUNDA_PX };
    linea.to(elegido, salida, 0);
  }
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
