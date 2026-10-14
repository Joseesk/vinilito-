import { describe, expect, it, vi } from 'vitest';
import { combinarDesconexiones } from './funciones';

describe('combinarDesconexiones', () => {
  it('llama a todas las funciones en orden', () => {
    const orden: number[] = [];
    const desconectar = combinarDesconexiones([() => orden.push(1), () => orden.push(2)]);
    expect(orden).toEqual([]);
    desconectar();
    expect(orden).toEqual([1, 2]);
  });

  it('con lista vacía no falla', () => {
    expect(() => combinarDesconexiones([])()).not.toThrow();
  });

  it('cada llamada vuelve a ejecutar las funciones', () => {
    const funcion = vi.fn();
    const desconectar = combinarDesconexiones([funcion]);
    desconectar();
    desconectar();
    expect(funcion).toHaveBeenCalledTimes(2);
  });
});
