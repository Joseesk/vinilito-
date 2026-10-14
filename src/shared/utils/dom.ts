export interface OpcionesElemento {
  readonly clases?: readonly string[];
  readonly atributos?: Readonly<Record<string, string>>;
  readonly texto?: string;
  /** Los strings se agregan como nodos de texto: nunca se interpretan como HTML. */
  readonly hijos?: readonly (Node | string)[];
}

export function crearElemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  opciones: OpcionesElemento = {},
): HTMLElementTagNameMap[K] {
  const { clases = [], atributos = {}, texto, hijos = [] } = opciones;
  const elemento = document.createElement(etiqueta);
  elemento.classList.add(...clases);
  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  elemento.append(...hijos);
  return elemento;
}

/** Lanza error si no existe: un nodo faltante es un bug de maquetado, no un caso a tolerar. */
export function obtenerElemento<T extends Element = HTMLElement>(
  selector: string,
  padre: ParentNode = document,
): T {
  const elemento = padre.querySelector<T>(selector);
  if (elemento === null) {
    throw new Error(`No se encontró el elemento "${selector}"`);
  }
  return elemento;
}
