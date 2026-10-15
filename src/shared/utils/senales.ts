import { esMovil } from '../animacion';
import type { SenalesDispositivo } from './dispositivo';

/** APIs que no todos los navegadores exponen (Chrome/Android sí; Safari no). */
interface NavegadorExtendido extends Navigator {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean; readonly effectiveType?: string };
}

/** Lo que el navegador dice del dispositivo y la red (lo usan el 3D y la música). */
export function leerSenales(): SenalesDispositivo {
  const navegador = navigator as NavegadorExtendido;
  return {
    esMovil: esMovil(),
    memoriaGb: navegador.deviceMemory,
    nucleos: navegador.hardwareConcurrency,
    ahorroDatos: navegador.connection?.saveData,
    tipoRed: navegador.connection?.effectiveType,
  };
}
