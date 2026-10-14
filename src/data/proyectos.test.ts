import { describe, expect, it } from 'vitest';
import { PROYECTOS } from './proyectos';

describe('PROYECTOS', () => {
  it('tiene exactamente 5 proyectos', () => {
    expect(PROYECTOS).toHaveLength(5);
  });

  it('tiene ids únicos', () => {
    const ids = new Set(PROYECTOS.map((proyecto) => proyecto.id));
    expect(ids.size).toBe(PROYECTOS.length);
  });

  it('numera los lomos del 1 al 5 sin repetir', () => {
    const numeros = PROYECTOS.map((proyecto) => proyecto.numero).sort((a, b) => a - b);
    expect(numeros).toEqual([1, 2, 3, 4, 5]);
  });

  it('usa un color de lomo distinto por proyecto', () => {
    const colores = new Set(PROYECTOS.map((proyecto) => proyecto.color));
    expect(colores.size).toBe(PROYECTOS.length);
  });

  it('no deja campos de texto vacíos', () => {
    const textos = PROYECTOS.flatMap((p) => [p.id, p.titulo, p.descripcion, p.portada, p.enlace]);
    expect(textos.every((texto) => texto.trim().length > 0)).toBe(true);
  });
});
