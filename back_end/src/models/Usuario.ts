export type Perfil = "admin" | "associado";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: Perfil;
  criado_em: string;
}

export type UsuarioPublico = Omit<Usuario, "senha_hash">;

export interface NovoUsuario {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: Perfil;
}
