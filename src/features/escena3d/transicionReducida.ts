import { gsap } from '../../shared/animacion';

/** Fundido corto a negro y de vuelta: el cambio de estado ocurre con el lienzo oculto. */
const DURACION_FUNDIDO = 0.25;

/**
 * Movimiento reducido: en lugar de reproducir la secuencia (cámara que viaja, disco que
 * vuela), el lienzo se funde, el estado salta al final (o al inicio, en reversa) y vuelve.
 * El timeline completo se arma igual, así abrir y cerrar dejan exactamente el mismo estado.
 */
export function envolverEnFundido(
  completa: gsap.core.Timeline,
  lienzo: HTMLCanvasElement,
): gsap.core.Timeline {
  const fundido = gsap.timeline({ paused: true });
  fundido.to(lienzo, { opacity: 0, duration: DURACION_FUNDIDO, ease: 'none' });
  // `call` corre en las dos direcciones: hacia adelante va al final, en reversa al inicio
  fundido.call(() => {
    completa.progress(fundido.reversed() ? 0 : 1);
  });
  fundido.to(lienzo, { opacity: 1, duration: DURACION_FUNDIDO, ease: 'none' });
  return fundido;
}
