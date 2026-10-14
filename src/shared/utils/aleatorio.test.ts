import { describe, expect, it } from 'vitest';
import { crearAleatorio, entre } from './aleatorio';

const tomar = (azar: () => number, cantidad: number): number[] =>
  Array.from({ length: cantidad }, () => azar());

describe('crearAleatorio', () => {
  it('la misma semilla da la misma secuencia', () => {
    expect(tomar(crearAleatorio(42), 5)).toEqual(tomar(crearAleatorio(42), 5));
  });

  it('semillas distintas dan secuencias distintas', () => {
    expect(tomar(crearAleatorio(1), 5)).not.toEqual(tomar(crearAleatorio(2), 5));
  });

  it('siempre devuelve valores en [0, 1)', () => {
    const valores = tomar(crearAleatorio(7), 1000);
    expect(valores.every((valor) => valor >= 0 && valor < 1)).toBe(true);
  });

  it('se reparte en todo el rango (no se queda en un extremo)', () => {
    const valores = tomar(crearAleatorio(3), 1000);
    expect(Math.min(...valores)).toBeLessThan(0.1);
    expect(Math.max(...valores)).toBeGreaterThan(0.9);
  });
});

describe('entre', () => {
  it('escala al rango pedido', () => {
    const valores = tomar(() => entre(crearAleatorio(9), 2, 5), 200);
    expect(valores.every((valor) => valor >= 2 && valor < 5)).toBe(true);
  });

  it('con azar fijo devuelve el extremo esperado', () => {
    expect(entre(() => 0, 2, 5)).toBe(2);
    expect(entre(() => 0.5, 2, 4)).toBe(3);
  });
});
