import { beforeEach, describe, expect, it } from 'vitest';
import { crearElemento, leerToken, obtenerElemento } from './dom';

describe('crearElemento', () => {
  it('crea la etiqueta pedida sin opciones', () => {
    const boton = crearElemento('button');
    expect(boton).toBeInstanceOf(HTMLButtonElement);
    expect(boton.attributes).toHaveLength(0);
    expect(boton.childNodes).toHaveLength(0);
  });

  it('aplica clases y atributos', () => {
    const lomo = crearElemento('button', {
      clases: ['lomo', 'lomo--activo'],
      atributos: { 'data-id': 'mapa-sonoro', 'aria-expanded': 'false' },
    });
    expect([...lomo.classList]).toEqual(['lomo', 'lomo--activo']);
    expect(lomo.dataset['id']).toBe('mapa-sonoro');
    expect(lomo.getAttribute('aria-expanded')).toBe('false');
  });

  it('agrega texto sin interpretarlo como HTML', () => {
    const parrafo = crearElemento('p', { texto: '<b>hola</b>' });
    expect(parrafo.textContent).toBe('<b>hola</b>');
    expect(parrafo.children).toHaveLength(0);
  });

  it('agrega hijos nodo y string en orden', () => {
    const numero = crearElemento('span', { texto: '1' });
    const lomo = crearElemento('div', { hijos: [numero, 'Mapa sonoro'] });
    expect(lomo.firstChild).toBe(numero);
    expect(lomo.textContent).toBe('1Mapa sonoro');
  });

  it('pone los hijos después del texto', () => {
    const titulo = crearElemento('h2', { texto: 'Año ', hijos: ['2026'] });
    expect(titulo.textContent).toBe('Año 2026');
  });
});

describe('obtenerElemento', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('devuelve el elemento del documento', () => {
    const app = crearElemento('div', { atributos: { id: 'app' } });
    document.body.append(app);
    expect(obtenerElemento('#app')).toBe(app);
  });

  it('busca solo dentro del padre indicado', () => {
    const fuera = crearElemento('span', { clases: ['numero'] });
    const dentro = crearElemento('span', { clases: ['numero'] });
    const padre = crearElemento('div', { hijos: [dentro] });
    document.body.append(fuera, padre);
    expect(obtenerElemento('.numero', padre)).toBe(dentro);
  });

  it('lanza error con el selector si no existe', () => {
    expect(() => obtenerElemento('#inexistente')).toThrow('#inexistente');
  });
});

describe('leerToken', () => {
  it('lee una variable CSS definida en :root', () => {
    document.documentElement.style.setProperty('--prueba', ' #123456 ');
    expect(leerToken('--prueba')).toBe('#123456');
    document.documentElement.style.removeProperty('--prueba');
  });

  it('lanza error con el nombre si no existe', () => {
    expect(() => leerToken('--no-existe')).toThrow('--no-existe');
  });
});
