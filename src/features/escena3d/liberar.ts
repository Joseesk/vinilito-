import type { Material, Mesh, Texture } from 'three';

function esTextura(valor: unknown): valor is Texture {
  return typeof valor === 'object' && valor !== null && 'isTexture' in valor;
}

/** Las texturas propias (mapas) también ocupan GPU: se liberan junto con el material. */
function liberarMaterial(material: Material, conservar: readonly Texture[]): void {
  Object.values(material).forEach((valor) => {
    if (esTextura(valor) && !conservar.includes(valor)) {
      valor.dispose();
    }
  });
  material.dispose();
}

/**
 * Quita una malla de su padre y libera geometría, materiales y texturas en la GPU.
 * `conservar`: texturas compartidas que no se tocan (p. ej. el entorno de reflejos).
 */
export function liberarMalla(malla: Mesh, conservar: readonly Texture[] = []): void {
  malla.removeFromParent();
  malla.geometry.dispose();
  const materiales = Array.isArray(malla.material) ? malla.material : [malla.material];
  new Set(materiales).forEach((material) => liberarMaterial(material, conservar));
}
