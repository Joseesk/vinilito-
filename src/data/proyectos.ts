import type { Proyecto } from '../shared/types/proyecto';

/** La repisa y la paleta (`--disco-1` … `--disco-10`) están pensadas para este máximo. */
export const MAXIMO_PROYECTOS = 10;

// Placeholders: el contenido real llega en el Sprint 12
export const PROYECTOS: readonly Proyecto[] = [
  {
    id: 'mapa-sonoro',
    numero: 1,
    titulo: 'Mapa sonoro',
    anio: 2026,
    color: 'disco-1',
    descripcion: 'Mapa interactivo que reproduce sonidos grabados en distintos barrios.',
    portada: '/covers/1.jpg',
    enlace: 'https://example.com/mapa-sonoro',
  },
  {
    id: 'tipos-moviles',
    numero: 2,
    titulo: 'Tipos móviles',
    anio: 2025,
    color: 'disco-2',
    descripcion: 'Herramienta para componer afiches tipográficos con animación.',
    portada: '/covers/2.jpg',
    enlace: 'https://example.com/tipos-moviles',
  },
  {
    id: 'huerta-urbana',
    numero: 3,
    titulo: 'Huerta urbana',
    anio: 2025,
    color: 'disco-3',
    descripcion: 'App para organizar turnos de riego en huertas comunitarias.',
    portada: '/covers/3.jpg',
    enlace: 'https://example.com/huerta-urbana',
  },
  {
    id: 'archivo-vivo',
    numero: 4,
    titulo: 'Archivo vivo',
    anio: 2024,
    color: 'disco-4',
    descripcion: 'Catálogo digital de fotografías familiares con línea de tiempo.',
    portada: '/covers/4.jpg',
    enlace: 'https://example.com/archivo-vivo',
  },
  {
    id: 'cuaderno-abierto',
    numero: 5,
    titulo: 'Cuaderno abierto',
    anio: 2024,
    color: 'disco-5',
    descripcion: 'Blog minimalista para publicar bocetos y notas de proceso.',
    portada: '/covers/5.jpg',
    enlace: 'https://example.com/cuaderno-abierto',
  },
];
