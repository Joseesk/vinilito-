import { describe, expect, it } from 'vitest';
import { obtenerDominio } from './url';

describe('obtenerDominio', () => {
  it('devuelve el dominio sin ruta ni protocolo', () => {
    expect(obtenerDominio('https://ejemplo.com/proyectos/1?a=b')).toBe('ejemplo.com');
  });

  it('quita el www inicial', () => {
    expect(obtenerDominio('https://www.youtube.com/watch?v=1')).toBe('youtube.com');
  });

  it('conserva otros subdominios', () => {
    expect(obtenerDominio('https://app.ejemplo.com')).toBe('app.ejemplo.com');
  });

  it('devuelve vacío si la URL no es válida', () => {
    expect(obtenerDominio('no es una url')).toBe('');
  });
});
