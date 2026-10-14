export interface EnlacePerfil {
  readonly etiqueta: string;
  readonly url: string;
}

export interface Perfil {
  readonly nombre: string;
  readonly rol: string;
  readonly email: string;
  readonly enlaces: readonly EnlacePerfil[];
}
