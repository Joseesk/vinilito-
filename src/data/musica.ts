import type { Pista } from '../shared/types/musica';

/** Kevin MacLeod: misma autoría y licencia (CC BY 4.0 exige el crédito de la ficha). */
const INCOMPETECH = {
  autor: 'Kevin MacLeod (incompetech.com)',
  fuente: 'https://incompetech.com',
  licencia: 'CC BY 4.0',
  urlLicencia: 'https://creativecommons.org/licenses/by/4.0/',
} as const;

/** Pixabay no exige crédito, pero se muestra igual: la ficha trata todas las pistas por igual. */
const PIXABAY = {
  licencia: 'Licencia de Pixabay',
  urlLicencia: 'https://pixabay.com/service/license-summary/',
} as const;

/**
 * Grabaciones reales de la aguja de Stratocube en Freesound, mismo tocadiscos (CC0: sin crédito
 * obligatorio). Baja: https://freesound.org/people/Stratocube/sounds/456281/ · Sube: .../456280/
 */
export const SONIDOS_AGUJA = {
  baja: '/musica/aguja-baja.mp3',
  sube: '/musica/aguja-sube.mp3',
} as const;

/**
 * Pista de cada disco por su `numero` (disco 1 = proyecto con `numero: 1`). Música libre "al
 * estilo de" una canción de referencia (comentario). Recortes de ~60 s alineados al compás,
 * a 96 kbps (≤ 0.72 MB), en `public/musica/`.
 */
export const PISTAS: Readonly<Record<number, Pista>> = {
  // Ref.: Satisfaction — The Rolling Stones
  1: { titulo: 'Hustle', url: '/musica/1.mp3', ...INCOMPETECH },
  // Ref.: Gran pecador — Chico Trujillo
  2: { titulo: 'No Frills Cumbia (rápida)', url: '/musica/2.mp3', ...INCOMPETECH },
  // Ref.: El gil de tu ex — Santaferia (cumbia chilena con bronces)
  3: {
    titulo: 'Cumbia de fuego',
    url: '/musica/3.mp3',
    autor: 'Jean-Paul-V (Pixabay)',
    fuente: 'https://pixabay.com/music/samba-latin-cumbia-de-fuego-276499/',
    ...PIXABAY,
  },
  // Ref.: Pumping on your stereo — Supergrass
  4: { titulo: 'Feelin Good', url: '/musica/4.mp3', ...INCOMPETECH },
  // Ref.: Save it for later — The Beat
  5: { titulo: 'Blue Ska', url: '/musica/5.mp3', ...INCOMPETECH },
  // Ref.: Para la gilada — Meta Guacha (cumbia villera)
  6: {
    titulo: 'Fiesta en la villa',
    url: '/musica/6.mp3',
    autor: 'Playlistsons (Pixabay)',
    fuente: 'https://pixabay.com/music/folk-fiesta-en-la-villa-426229/',
    ...PIXABAY,
  },
  // Ref.: El viejo — La Vela Puerca
  7: { titulo: 'There It Is', url: '/musica/7.mp3', ...INCOMPETECH },
  // Ref.: Paramar — Los Prisioneros
  8: { titulo: 'Newer Wave', url: '/musica/8.mp3', ...INCOMPETECH },
  // Ref.: Locura espacial — Chancho en Piedra
  9: { titulo: 'Funky Chunk', url: '/musica/9.mp3', ...INCOMPETECH },
  // Ref.: By the way — Red Hot Chili Peppers
  10: { titulo: 'Rocket Power', url: '/musica/10.mp3', ...INCOMPETECH },
};
