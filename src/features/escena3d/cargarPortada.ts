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
      return textura;
    })
    // Sin imagen (aún no hay portadas, o falla la red) queda la portada impresa
    .catch(() => null);
  pedidos.set(url, pedido);
  return pedido;
}

/**
 * Carga la portada real solo al abrir ese disco (pensado para conexiones lentas) y la pone
 * en las caras de portada de la funda. `materialPortada` es el que comparten ±x.
 */
export async function aplicarPortada(
  url: string,
  {
    materialPortada,
    alAplicar,
  }: { readonly materialPortada: Material | undefined; readonly alAplicar: () => void },
): Promise<void> {
  const textura = await pedirPortada(url);
  if (!textura || !(materialPortada instanceof MeshStandardMaterial)) {
    return;
  }
  materialPortada.map = textura;
  materialPortada.needsUpdate = true;
  alAplicar();
}
