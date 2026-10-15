/**
 * Enlace `wa.me` que abre el chat con el mensaje ya escrito (app en móvil, web en escritorio).
 * `wa.me` exige el número solo con dígitos: se quitan `+`, espacios y guiones.
 */
export function crearEnlaceWhatsapp(numero: string, mensaje: string): string {
  const digitos = numero.replace(/\D/g, '');
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}

/** `mailto:` con el asunto ya escrito: quien escribe no parte de un correo en blanco. */
export function crearEnlaceEmail(direccion: string, asunto: string): string {
  return `mailto:${direccion}?subject=${encodeURIComponent(asunto)}`;
}
