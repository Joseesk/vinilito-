/** Junta varias funciones de limpieza (p. ej. las que devuelve `escuchar`) en una sola. */
export function combinarDesconexiones(desconexiones: readonly (() => void)[]): () => void {
  return () => desconexiones.forEach((desconectar) => desconectar());
}
