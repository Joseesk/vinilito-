/** Logos disponibles como máscara CSS (`.boton__icono--<nombre>` en escena.css). */
export type IconoEnlace = 'github';

export interface EnlacePerfil {
  /** Con `icono`, solo la leen los lectores de pantalla: a la vista queda el logo. */
  readonly etiqueta: string;
  readonly url: string;
  readonly icono?: IconoEnlace;
}

/** Contacto principal (llamado a la acción del cartel). */
export interface WhatsappPerfil {
  /** Con código de país, solo dígitos o con `+`/espacios (se limpian al armar el enlace). */
  readonly numero: string;
  /** Texto ya escrito al abrir el chat. */
  readonly mensaje: string;
}

export interface Perfil {
  readonly nombre: string;
  readonly rol: string;
  /** Frase de servicio: qué gana el cliente. */
  readonly propuesta: string;
  readonly email: string;
  /** Asunto ya escrito al abrir el correo. */
  readonly asuntoEmail: string;
  readonly whatsapp: WhatsappPerfil;
  readonly enlaces: readonly EnlacePerfil[];
}
