export function obtenerLomos(escena: HTMLElement): HTMLElement[] {
  return [...escena.querySelectorAll<HTMLElement>('.lomo')];
}

export function buscarLomo(escena: HTMLElement, id: string): HTMLElement | undefined {
  return obtenerLomos(escena).find((lomo) => lomo.dataset['id'] === id);
}
