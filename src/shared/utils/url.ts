/**
 * Dominio legible de una URL (`https://www.ejemplo.com/a` → `ejemplo.com`).
 * Vacío si la URL no es válida: quien lo muestra decide qué hacer sin atrapar errores.
 */
export function obtenerDominio(url: string): string {
  // try/catch y no URL.canParse: este último no existe en Safari < 17
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
