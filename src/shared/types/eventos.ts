export interface PayloadProyecto {
  readonly id: string;
}

/** Rectángulo en coordenadas de viewport: un dato, no un nodo, para no acoplar features. */
export interface Rectangulo {
  readonly x: number;
  readonly y: number;
  readonly ancho: number;
  readonly alto: number;
}

/** El vinilo necesita saber desde dónde sale la funda (el lomo clickeado). */
export interface PayloadSeleccion extends PayloadProyecto {
  readonly origen: Rectangulo;
}

/** Mapa de eventos entre features (sección 1 de sprint.md). `undefined` = sin payload. */
export interface EventosApp {
  'proyecto:seleccionado': PayloadSeleccion;
  /** Lleva el `origen` para que el animador sepa desde dónde sale la funda. */
  'vinilo:abriendo': PayloadSeleccion;
  'vinilo:abierto': PayloadProyecto;
  'vinilo:cerrar': undefined;
  'vinilo:cerrando': PayloadProyecto;
  'vinilo:cerrado': PayloadProyecto;
  /** Los emite el animador activo (CSS o 3D) al terminar: el estado no conoce la animación. */
  'animacion:abierta': PayloadProyecto;
  'animacion:cerrada': PayloadProyecto;
}

export type NombreEvento = keyof EventosApp;

export type ManejadorEvento<N extends NombreEvento> = (payload: EventosApp[N]) => void;

/** Eventos sin payload se emiten sin segundo argumento: `emitir('vinilo:cerrar')`. */
export type ArgumentosEvento<N extends NombreEvento> = EventosApp[N] extends undefined
  ? []
  : [payload: EventosApp[N]];
