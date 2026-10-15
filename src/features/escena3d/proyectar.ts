import { type Camera, type Object3D, Vector3 } from 'three';
import type { Rectangulo } from '../../shared/types/eventos';

const punto = new Vector3();

/**
 * Rectángulo en pantalla (px de viewport) que ocupan unos puntos locales de un objeto 3D.
 * Para los botones accesibles se proyectan solo las 4 esquinas del lomo: si se proyectara la
 * caja entera, su fondo (31 cm) se corre hacia el centro por la perspectiva y el botón
 * pisaría al lomo vecino.
 */
export function proyectarPuntos(
  puntos: readonly Vector3[],
  objeto: Object3D,
  { camara, lienzo }: { readonly camara: Camera; readonly lienzo: HTMLCanvasElement },
): Rectangulo {
  objeto.updateWorldMatrix(true, false);
  // La cámara puede haberse movido sin render de por medio (reencuadre al redimensionar):
  // `project()` usa su matriz inversa, que si no se actualiza queda la del último cuadro
  camara.updateMatrixWorld();
  const { left, top, width, height } = lienzo.getBoundingClientRect();
  const xs: number[] = [];
  const ys: number[] = [];
  for (const local of puntos) {
    punto.copy(local).applyMatrix4(objeto.matrixWorld).project(camara);
    xs.push(left + ((punto.x + 1) / 2) * width);
    ys.push(top + ((1 - punto.y) / 2) * height);
  }
  const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
  return { x: minX, y: minY, ancho: Math.max(...xs) - minX, alto: Math.max(...ys) - minY };
}
