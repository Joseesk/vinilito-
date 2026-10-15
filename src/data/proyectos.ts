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
    captura:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
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
    captura:
      'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
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
    captura:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://example.com/huerta-urbana',
  },
  {
    id: 'archivo-vivo',
    numero: 4,
    titulo: 'Archivo vivo',
    anio: 2024,
    color: 'disco-4',
    descripcion: 'Catálogo digital de fotografías familiares con línea de tiempo.',
    portada:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    captura:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
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
    captura:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://example.com/cuaderno-abierto',
  },
  {
    id: 'la-macarena',
    numero: 6,
    titulo: 'Dale a tu cuerpo alegría macarena ',
    anio: 1993,
    color: 'disco-6',
    descripcion: 'Canción bailable.',
    portada: '/covers/6.jpg',
    captura:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
  },

  {
    id: 'la-la',
    numero: 7,
    titulo: 'Avanza-gestión',
    anio: 2025,
    color: 'disco-7',
    descripcion: 'Dancing pi 1',
    portada:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=800&fit=crop&auto=format&q=75',
    captura:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
  },

  {
    id: 'id-2',
    numero: 8,
    titulo: 'Luzu-tv',
    anio: 2026,
    color: 'disco-8',
    descripcion: 'Dancing pi',
    portada: '/covers/8.jpg',
    captura:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
  },

  {
    id: 'id-3',
    numero: 9,
    titulo: 'Luzu-tv',
    anio: 2026,
    color: 'disco-9',
    descripcion: 'Dancing pi',
    portada: '/covers/9.jpg',
    captura:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
  },

  {
    id: 'id-4',
    numero: 10,
    titulo: 'Luzu-tv',
    anio: 2026,
    color: 'disco-10',
    descripcion: 'Dancing pi 3',
    portada: '/covers/10.jpg',
    captura:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&crop=top&auto=format&q=75',
    enlace: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
  },
];
