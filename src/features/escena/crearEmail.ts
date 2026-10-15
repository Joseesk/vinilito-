import { DURACION_AVISO, gsap } from '../../shared/animacion';
import { copiarTexto, crearElemento, crearEnlaceEmail, crearIcono } from '../../shared/utils';

const TEXTO_COPIADO = '¡Copiado!';
/** El ícono de copiar pasa a ✓ mientras dura el aviso. */
const CLASE_LISTO = 'boton__icono--listo';

interface PiezasCopiado {
  readonly boton: HTMLButtonElement;
  readonly icono: HTMLElement;
  readonly aviso: HTMLElement;
}

function conectarCopiado({ boton, icono, aviso }: PiezasCopiado, email: string): void {
  let limpieza: gsap.core.Tween | null = null;
  const copiar = async (): Promise<void> => {
    const copiado = await copiarTexto(email);
    limpieza?.kill();
    icono.classList.toggle(CLASE_LISTO, copiado);
    // Si el navegador no deja copiar, se muestra la dirección (seleccionable) y no se borra
    aviso.textContent = copiado ? TEXTO_COPIADO : email;
    if (!copiado) {
      return;
    }
    limpieza = gsap.delayedCall(DURACION_AVISO, () => {
      aviso.textContent = '';
      icono.classList.remove(CLASE_LISTO);
    });
  };
  boton.addEventListener('click', () => void copiar());
}

/**
 * Email en dos acciones: abrir el correo (con asunto) o copiar la dirección. `mailto:` no hace
 * nada en un computador sin programa de correo configurado; copiar funciona siempre.
 */
export function crearEmail(email: string, asunto: string): HTMLLIElement {
  const enlace = crearElemento('a', {
    clases: ['cartel__enlace', 'boton'],
    atributos: { href: crearEnlaceEmail(email, asunto) },
    hijos: [crearIcono('email'), 'Email'],
  });
  const icono = crearIcono('copiar');
  const boton = crearElemento('button', {
    clases: ['cartel__enlace', 'cartel__copiar', 'boton'],
    atributos: { type: 'button' },
    hijos: [icono, crearElemento('span', { clases: ['solo-lectores'], texto: 'Copiar email' })],
  });
  // role="status": los lectores de pantalla anuncian "¡Copiado!" sin mover el foco
  const aviso = crearElemento('span', { clases: ['cartel__aviso'], atributos: { role: 'status' } });
  conectarCopiado({ boton, icono, aviso }, email);
  return crearElemento('li', { clases: ['cartel__email'], hijos: [enlace, boton, aviso] });
}
