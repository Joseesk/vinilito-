import { BoxGeometry, type Material, Mesh, MeshStandardMaterial } from 'three';
import { entre, leerToken } from '../../shared/utils';
import { crearTextura, type Pintor } from './texturas';

/** Metros: apenas más chica que la funda de cartón (31.4 cm) para entrar en ella. */
export const MEDIDAS_INTERNA = { lado: 0.305, espesor: 0.003 } as const;
/** Agujero central de la funda interna: deja ver la etiqueta del disco. */
const RADIO_AGUJERO = 0.17;
const CANTIDAD_ARRUGAS = 18;
const SEMILLA_INTERNA = 41;

/** Papel claro con arrugas suaves y el agujero recortado (transparente → `alphaTest`). */
const pintarInterna: Pintor = (contexto, { ancho: lado }, azar) => {
  contexto.fillStyle = leerToken('--papel-interno');
  contexto.fillRect(0, 0, lado, lado);
  contexto.strokeStyle = leerToken('--papel-arruga');
  for (let i = 0; i < CANTIDAD_ARRUGAS; i++) {
    contexto.lineWidth = entre(azar, 1, 4);
    contexto.beginPath();
    contexto.moveTo(azar() * lado, azar() * lado);
    contexto.lineTo(azar() * lado, azar() * lado);
    contexto.stroke();
  }
  contexto.globalCompositeOperation = 'destination-out';
  contexto.beginPath();
  contexto.arc(lado / 2, lado / 2, lado * RADIO_AGUJERO, 0, Math.PI * 2);
  contexto.fill();
  contexto.globalCompositeOperation = 'source-over';
};

/**
 * Funda interna como caja finita (eje x = espesor, como la de cartón): las caras ±x llevan
 * el papel con el agujero; por el agujero se ve el disco que va adentro.
 */
export function crearFundaInterna(ladoTextura: number): Mesh<BoxGeometry, Material[]> {
  const lado = ladoTextura / 2;
  const textura = crearTextura(
    { ancho: lado, alto: lado, semilla: SEMILLA_INTERNA },
    pintarInterna,
  );
  const cara = new MeshStandardMaterial({ map: textura, alphaTest: 0.5, roughness: 0.9 });
  const canto = new MeshStandardMaterial({ color: leerToken('--papel-interno'), roughness: 0.9 });
  const { lado: tamanio, espesor } = MEDIDAS_INTERNA;
  return new Mesh(new BoxGeometry(espesor, tamanio, tamanio), [
    cara,
    cara,
    canto,
    canto,
    canto,
    canto,
  ]);
}
