import { describe, expect, it } from 'vitest';
import { MAXIMO_PROYECTOS, PROYECTOS } from './proyectos';

describe('PROYECTOS', () => {
  it(`tiene entre 1 y ${MAXIMO_PROYECTOS} proyectos`, () => {
    expect(PROYECTOS.length).toBeGreaterThanOrEqual(1);
    expect(PROYECTOS.length).toBeLessThanOrEqual(MAXIMO_PROYECTOS);
  });

  it('tiene ids únicos', () => {
    const ids = new Set(PROYECTOS.map((proyecto) => proyecto.id));
    expect(ids.size).toBe(PROYECTOS.length);
  });

  it('numera los discos de 1 a N sin huecos ni repetidos', () => {
    const numeros = PROYECTOS.map((proyecto) => proyecto.numero).sort((a, b) => a - b);
    const esperados = PROYECTOS.map((_, indice) => indice + 1);
    expect(numeros).toEqual(esperados);
  });

  it('usa un color de disco distinto por proyecto', () => {
    const colores = new Set(PROYECTOS.map((proyecto) => proyecto.color));
    expect(colores.size).toBe(PROYECTOS.length);
  });

  it('no deja campos de texto vacíos', () => {
    const textos = PROYECTOS.flatMap((p) => [p.id, p.titulo, p.descripcion, p.portada, p.enlace]);
    expect(textos.every((texto) => texto.trim().length > 0)).toBe(true);
  });
});
