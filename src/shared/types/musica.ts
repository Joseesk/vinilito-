/** Pista que suena con un disco. Música libre: la licencia y el crédito viajan con ella. */
export interface Pista {
  readonly titulo: string;
  /** Ruta en `public/` o URL externa (con CORS: pasa por la Web Audio API). */
  readonly url: string;
  readonly autor: string;
  /** Dónde se publica la pista (enlace del autor en el crédito). */
  readonly fuente: string;
  readonly licencia: string;
  readonly urlLicencia: string;
}
