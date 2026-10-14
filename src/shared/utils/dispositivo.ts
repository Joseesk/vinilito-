export type NivelCalidad = 'alta' | 'baja';

/** Lo que se sabe del dispositivo y la red. Los campos faltan en navegadores que no los exponen. */
export interface SenalesDispositivo {
  readonly esMovil: boolean;
  readonly memoriaGb?: number;
  readonly nucleos?: number;
  readonly ahorroDatos?: boolean;
  readonly tipoRed?: string;
}

const MINIMO_MEMORIA_GB = 4;
const MINIMO_NUCLEOS = 4;
const REDES_LENTAS: readonly string[] = ['slow-2g', '2g', '3g'];

export function esRedLenta(senales: SenalesDispositivo): boolean {
  return senales.tipoRed !== undefined && REDES_LENTAS.includes(senales.tipoRed);
}

/** Con "ahorro de datos" o red 2G no se descarga la escena 3D (~150 KB): queda la versión CSS. */
export function debeCargar3d(senales: SenalesDispositivo): boolean {
  const esRedMuyLenta = senales.tipoRed === 'slow-2g' || senales.tipoRed === '2g';
  return senales.ahorroDatos !== true && !esRedMuyLenta;
}

/** Ante la duda, `baja`: un celular modesto con calidad alta se traba, uno potente con baja no. */
export function clasificarCalidad(senales: SenalesDispositivo): NivelCalidad {
  const pocaMemoria = senales.memoriaGb !== undefined && senales.memoriaGb < MINIMO_MEMORIA_GB;
  const pocosNucleos = senales.nucleos !== undefined && senales.nucleos < MINIMO_NUCLEOS;
  const esLimitado = senales.esMovil || pocaMemoria || pocosNucleos || esRedLenta(senales);
  return esLimitado ? 'baja' : 'alta';
}
