import { describe, expect, it } from 'vitest';
import { crearEnlaceEmail, crearEnlaceWhatsapp } from './contacto';

describe('crearEnlaceWhatsapp', () => {
  it('deja el número solo con dígitos', () => {
    expect(crearEnlaceWhatsapp('+56 9 5198-8787', 'hola')).toBe(
      'https://wa.me/56951988787?text=hola',
    );
  });

  it('codifica el mensaje (espacios, tildes, signos)', () => {
    const enlace = crearEnlaceWhatsapp('56911112222', 'Hola José, ¿cotizamos?');
    expect(enlace).toBe('https://wa.me/56911112222?text=Hola%20Jos%C3%A9%2C%20%C2%BFcotizamos%3F');
  });
});

describe('crearEnlaceEmail', () => {
  it('agrega el asunto codificado', () => {
    expect(crearEnlaceEmail('hola@ejemplo.com', 'Cotización web')).toBe(
      'mailto:hola@ejemplo.com?subject=Cotizaci%C3%B3n%20web',
    );
  });
});
