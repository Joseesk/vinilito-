import { esMovil } from '../../shared/animacion';
import { clasificarCalidad, type NivelCalidad, type SenalesDispositivo } from '../../shared/utils';

/** APIs que no todos los navegadores exponen (Chrome/Android sí; Safari no). */
interface NavegadorExtendido extends Navigator {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean; readonly effectiveType?: string };
}

export interface ConfiguracionCalidad {
  readonly nivel: NivelCalidad;
  readonly dprMaximo: number;
  readonly antialias: boolean;
  readonly sombras: boolean;
  /** Lado en px de las texturas generadas por código (madera, cartón, surcos). */
  readonly ladoTextura: number;
}

const CONFIGURACIONES: Readonly<Record<NivelCalidad, ConfiguracionCalidad>> = {
  alta: { nivel: 'alta', dprMaximo: 2, antialias: true, sombras: true, ladoTextura: 1024 },
  baja: { nivel: 'baja', dprMaximo: 1.5, antialias: false, sombras: false, ladoTextura: 512 },
};

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

export function detectarCalidad(senales: SenalesDispositivo): ConfiguracionCalidad {
  return CONFIGURACIONES[clasificarCalidad(senales)];
}
