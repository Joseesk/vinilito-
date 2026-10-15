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

/** Lo publica la música (al iniciar y al cambiar); lo refleja el botón de la ficha. */
export interface PayloadSonido {
  readonly silenciada: boolean;
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
  /** El estudio 3D ya dibujó: la escena CSS cede la repisa (queda el cartel). */
  'escena3d:lista': undefined;
  /** Botón de la ficha: silenciar / activar la música. */
  'musica:alternar': undefined;
  'musica:estado': PayloadSonido;
}

export type NombreEvento = keyof EventosApp;

export type ManejadorEvento<N extends NombreEvento> = (payload: EventosApp[N]) => void;

/** Eventos sin payload se emiten sin segundo argumento: `emitir('vinilo:cerrar')`. */
export type ArgumentosEvento<N extends NombreEvento> = EventosApp[N] extends undefined
  ? []
  : [payload: EventosApp[N]];
