import {
  type Material,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';

const cargador = new TextureLoader();
/** Una sola descarga por portada aunque el disco se abra varias veces. */
const pedidos = new Map<string, Promise<Texture | null>>();

function pedirPortada(url: string): Promise<Texture | null> {
  const existente = pedidos.get(url);
  if (existente) {
    return existente;
  }
  const pedido = cargador
    .loadAsync(url)
    .then((textura) => {
      textura.colorSpace = SRGBColorSpace;
      // La comparten la funda y cada disco que se abre: liberarMalla() no la toca
      textura.userData['compartida'] = true;
      return textura;
    })
    // Sin imagen (aún no hay portadas, o falla la red) queda la portada impresa
    .catch(() => null);
  pedidos.set(url, pedido);
  return pedido;
}

/**
 * Carga la portada real solo al abrir ese disco (pensado para conexiones lentas) y la pone en
 * cada material: las caras ±x de la funda y la etiqueta del disco. Los materiales ocultos
 * (la etiqueta, mientras no hay imagen) se muestran al recibirla.
 */
export async function aplicarPortada(
  url: string,
  {
    materiales,
    alAplicar,
  }: { readonly materiales: readonly (Material | undefined)[]; readonly alAplicar: () => void },
): Promise<void> {
  const textura = await pedirPortada(url);
  if (!textura) {
    return;
  }
  materiales.forEach((material) => {
    if (!(material instanceof MeshStandardMaterial)) {
      return;
    }
    material.map = textura;
    material.visible = true;
    material.needsUpdate = true;
  });
  alAplicar();
}
