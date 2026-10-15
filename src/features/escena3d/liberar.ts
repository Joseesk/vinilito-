import { type Material, Mesh, type Texture } from 'three';

function esTextura(valor: unknown): valor is Texture {
  return typeof valor === 'object' && valor !== null && 'isTexture' in valor;
}

/** Las de `cargarPortada` se reutilizan entre aperturas: liberarlas obligaría a resubirlas. */
function esCompartida(textura: Texture, conservar: readonly Texture[]): boolean {
  return conservar.includes(textura) || textura.userData['compartida'] === true;
}

/** Las texturas propias (mapas) también ocupan GPU: se liberan junto con el material. */
function liberarMaterial(material: Material, conservar: readonly Texture[]): void {
  Object.values(material).forEach((valor) => {
    if (esTextura(valor) && !esCompartida(valor, conservar)) {
      valor.dispose();
    }
  });
  material.dispose();
}

/**
 * Quita una malla de su padre y libera en la GPU geometría, materiales y texturas, suyas y de
 * sus hijas (p. ej. la etiqueta del disco).
 * `conservar`: texturas compartidas que no se tocan (p. ej. el entorno de reflejos).
 */
export function liberarMalla(malla: Mesh, conservar: readonly Texture[] = []): void {
  malla.removeFromParent();
  malla.traverse((objeto) => {
    if (!(objeto instanceof Mesh)) {
      return;
    }
    objeto.geometry.dispose();
    const materiales: Material[] = Array.isArray(objeto.material)
      ? objeto.material
      : [objeto.material];
    new Set(materiales).forEach((material) => liberarMaterial(material, conservar));
  });
}
