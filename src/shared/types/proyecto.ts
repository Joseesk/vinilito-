/** Nombres de token de `tokens.css` (`--disco-N`): los datos nunca guardan hex. */
export type ColorLomo =
  | 'disco-1'
  | 'disco-2'
  | 'disco-3'
  | 'disco-4'
  | 'disco-5'
  | 'disco-6'
  | 'disco-7'
  | 'disco-8'
  | 'disco-9'
  | 'disco-10';

export interface Proyecto {
  readonly id: string;
  readonly numero: number;
  readonly titulo: string;
  readonly anio: number;
  readonly color: ColorLomo;
  readonly descripcion: string;
  readonly portada: string;
  readonly enlace: string;
}
