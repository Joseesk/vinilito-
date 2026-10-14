import { describe, expect, it } from 'vitest';
import { clasificarCalidad, debeCargar3d, esRedLenta } from './dispositivo';

const ESCRITORIO = { esMovil: false, memoriaGb: 8, nucleos: 8, tipoRed: '4g' };

describe('clasificarCalidad', () => {
  it('escritorio con buen hardware y red → alta', () => {
    expect(clasificarCalidad(ESCRITORIO)).toBe('alta');
  });

  it('sin datos del navegador en escritorio → alta', () => {
    expect(clasificarCalidad({ esMovil: false })).toBe('alta');
  });

  it('cualquier móvil → baja', () => {
    expect(clasificarCalidad({ ...ESCRITORIO, esMovil: true })).toBe('baja');
  });

  it('poca memoria, pocos núcleos o red lenta → baja', () => {
    expect(clasificarCalidad({ ...ESCRITORIO, memoriaGb: 2 })).toBe('baja');
    expect(clasificarCalidad({ ...ESCRITORIO, nucleos: 2 })).toBe('baja');
    expect(clasificarCalidad({ ...ESCRITORIO, tipoRed: '3g' })).toBe('baja');
  });
});

describe('debeCargar3d', () => {
  it('carga por defecto', () => {
    expect(debeCargar3d(ESCRITORIO)).toBe(true);
    expect(debeCargar3d({ esMovil: true })).toBe(true);
  });

  it('no carga con ahorro de datos ni en 2G', () => {
    expect(debeCargar3d({ ...ESCRITORIO, ahorroDatos: true })).toBe(false);
    expect(debeCargar3d({ ...ESCRITORIO, tipoRed: '2g' })).toBe(false);
    expect(debeCargar3d({ ...ESCRITORIO, tipoRed: 'slow-2g' })).toBe(false);
  });

  it('en 3G sí carga (con calidad baja)', () => {
    expect(debeCargar3d({ ...ESCRITORIO, tipoRed: '3g' })).toBe(true);
  });
});

describe('esRedLenta', () => {
  it('detecta 3G o menos y tolera el dato ausente', () => {
    expect(esRedLenta({ esMovil: false, tipoRed: '3g' })).toBe(true);
    expect(esRedLenta({ esMovil: false, tipoRed: '4g' })).toBe(false);
    expect(esRedLenta({ esMovil: false })).toBe(false);
  });
});
