/**
 * Copia texto al portapapeles. `true` si funcionó; `false` si el navegador no lo permite
 * (sin HTTPS, sin permiso o sin la API): quien llama muestra una alternativa, no un error.
 */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
