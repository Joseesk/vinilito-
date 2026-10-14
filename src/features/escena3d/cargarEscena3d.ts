import { crearElemento, debeCargar3d, type SenalesDispositivo } from '../../shared/utils';
import { detectarCalidad, leerSenales } from './calidad';

/** Safari no tiene `requestIdleCallback`: se espera un poco para no competir con la intro. */
const ESPERA_SIN_IDLE_MS = 300;

function soportaWebGL(): boolean {
  const canvas = crearElemento('canvas');
  const contexto = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!contexto) {
    return false;
  }
  // Se libera ya: el renderer real crea su propio contexto y hay un límite por página
  contexto.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

function cuandoEsteLibre(tarea: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(tarea);
    return;
  }
  setTimeout(tarea, ESPERA_SIN_IDLE_MS);
}

async function cargar(contenedor: HTMLElement, senales: SenalesDispositivo): Promise<void> {
  if (!soportaWebGL()) {
    return;
  }
  try {
    // Import dinámico: `three` va en un chunk aparte y no demora el primer paint
    const { montarEscena3d } = await import('./renderizador');
    montarEscena3d(contenedor, detectarCalidad(senales));
  } catch {
    // Sin 3D (red caída, GPU bloqueada): queda la versión CSS, que es el respaldo
  }
}

/** La versión CSS ya está montada y funcionando; el 3D se suma después, si conviene. */
export function iniciarEscena3d(contenedor: HTMLElement): void {
  const senales = leerSenales();
  if (!debeCargar3d(senales)) {
    return;
  }
  cuandoEsteLibre(() => void cargar(contenedor, senales));
}
