/** Nombres de token de `tokens.css`: los datos nunca guardan hex. */
export type ColorLomo = 'mustard' | 'terracotta' | 'olive' | 'burgundy' | 'cream';

export type ColorTexto = 'ink' | 'cream';

export interface Proyecto {
  readonly id: string;
  readonly numero: number;
  readonly titulo: string;
  readonly anio: number;
  readonly color: ColorLomo;
  readonly colorTexto: ColorTexto;
  readonly descripcion: string;
  readonly portada: string;
  readonly enlace: string;
}
