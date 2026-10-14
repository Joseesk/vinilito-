export interface PayloadProyecto {
  readonly id: string;
}

/** Mapa de eventos entre features (sección 1 de sprint.md). `undefined` = sin payload. */
export interface EventosApp {
  'proyecto:seleccionado': PayloadProyecto;
  'vinilo:abriendo': PayloadProyecto;
  'vinilo:abierto': PayloadProyecto;
  'vinilo:cerrar': undefined;
  'vinilo:cerrando': PayloadProyecto;
  'vinilo:cerrado': PayloadProyecto;
}

export type NombreEvento = keyof EventosApp;

export type ManejadorEvento<N extends NombreEvento> = (payload: EventosApp[N]) => void;

/** Eventos sin payload se emiten sin segundo argumento: `emitir('vinilo:cerrar')`. */
export type ArgumentosEvento<N extends NombreEvento> = EventosApp[N] extends undefined
  ? []
  : [payload: EventosApp[N]];
