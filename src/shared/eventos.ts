import type { ArgumentosEvento, EventosApp, ManejadorEvento, NombreEvento } from './types/eventos';

type RegistroManejadores = { [N in NombreEvento]?: Set<ManejadorEvento<N>> };

const registro: RegistroManejadores = {};

function obtenerManejadores<N extends NombreEvento>(nombre: N): Set<ManejadorEvento<N>> {
  const existentes: RegistroManejadores[N] = registro[nombre];
  if (existentes) {
    return existentes;
  }
  const nuevos = new Set<ManejadorEvento<N>>();
  registro[nombre] = nuevos as RegistroManejadores[N];
  return nuevos;
}

/** Devuelve una función que deja de escuchar, útil al hacer `kill()` de una feature. */
export function escuchar<N extends NombreEvento>(
  nombre: N,
  manejador: ManejadorEvento<N>,
): () => void {
  obtenerManejadores(nombre).add(manejador);
  return () => dejarDeEscuchar(nombre, manejador);
}

export function dejarDeEscuchar<N extends NombreEvento>(
  nombre: N,
  manejador: ManejadorEvento<N>,
): void {
  obtenerManejadores(nombre).delete(manejador);
}

export function emitir<N extends NombreEvento>(
  nombre: N,
  ...argumentos: ArgumentosEvento<N>
): void {
  const payload = argumentos[0] as EventosApp[N];
  // Copia: un manejador puede (des)suscribirse mientras se recorre la lista
  for (const manejador of [...obtenerManejadores(nombre)]) {
    manejador(payload);
  }
}
