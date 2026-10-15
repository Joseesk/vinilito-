import { afterEach, describe, expect, it, vi } from 'vitest';
import { copiarTexto } from './portapapeles';

describe('copiarTexto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('copia y devuelve true si el navegador lo permite', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copiarTexto('hola@ejemplo.com')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hola@ejemplo.com');
  });

  it('devuelve false si el navegador lo rechaza', async () => {
    const writeText = vi.fn(() => Promise.reject(new Error('sin permiso')));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copiarTexto('hola@ejemplo.com')).toBe(false);
  });

  it('devuelve false si no existe la API (sitio sin HTTPS)', async () => {
    vi.stubGlobal('navigator', {});
    expect(await copiarTexto('hola@ejemplo.com')).toBe(false);
  });
});
