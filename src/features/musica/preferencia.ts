const CLAVE = 'vinilo:musica-silenciada';

/**
 * Lo que eligió esta persona la última vez, o `null` si nunca tocó el botón. `localStorage`
 * puede no existir o lanzar (modo privado, almacenamiento bloqueado): se trata como "sin dato".
 */
export function leerSilencio(): boolean | null {
  try {
    const valor = localStorage.getItem(CLAVE);
    return valor === null ? null : valor === 'true';
  } catch {
    return null;
  }
}

export function guardarSilencio(silenciada: boolean): void {
  try {
    localStorage.setItem(CLAVE, String(silenciada));
  } catch {
    // Sin almacenamiento la preferencia dura solo esta visita
  }
}
