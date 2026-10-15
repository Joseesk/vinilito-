import { describe, expect, it } from 'vitest';
import { calcularFlip } from './geometria';

describe('calcularFlip', () => {
  it('lleva el centro del destino al centro del origen', () => {
    const origen = { x: 0, y: 0, ancho: 100, alto: 40 };
    const destino = { x: 200, y: 300, ancho: 100, alto: 40 };
    expect(calcularFlip(origen, destino)).toEqual({ x: -200, y: -300, scale: 1 });
  });

  it('escala para igualar la altura del origen', () => {
    const origen = { x: 10, y: 10, ancho: 20, alto: 20 };
    const destino = { x: 0, y: 0, ancho: 80, alto: 40 };
    expect(calcularFlip(origen, destino)).toEqual({ x: -20, y: 0, scale: 0.5 });
  });
});
