import { describe, expect, it } from 'vitest';
import { PISTAS, SONIDOS_AGUJA } from './musica';
import { MAXIMO_PROYECTOS } from './proyectos';

/** Archivos reales de `public/musica` (Vite los lista sin importarlos). */
const ARCHIVOS = Object.keys(import.meta.glob('/public/musica/*.mp3'));
const entradas = Object.entries(PISTAS);

describe('PISTAS', () => {
  it(`usa números de disco entre 1 y ${MAXIMO_PROYECTOS}`, () => {
    const numeros = entradas.map(([numero]) => Number(numero));
    expect(numeros.every((n) => Number.isInteger(n) && n >= 1 && n <= MAXIMO_PROYECTOS)).toBe(true);
  });

  it('no deja campos de texto vacíos (el crédito CC BY los necesita)', () => {
    const textos = entradas.flatMap(([, p]) => [p.titulo, p.url, p.autor, p.licencia]);
    expect(textos.every((texto) => texto.trim().length > 0)).toBe(true);
  });

  it('cada pista local existe en public/', () => {
    const locales = entradas.map(([, p]) => p.url).filter((url) => url.startsWith('/'));
    const faltantes = locales.filter((url) => !ARCHIVOS.includes(`/public${url}`));
    expect(faltantes).toEqual([]);
  });
});

describe('SONIDOS_AGUJA', () => {
  it('cada sonido existe en public/', () => {
    const faltantes = Object.values(SONIDOS_AGUJA).filter(
      (url) => !ARCHIVOS.includes(`/public${url}`),
    );
    expect(faltantes).toEqual([]);
  });
});
