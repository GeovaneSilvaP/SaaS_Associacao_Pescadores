// Define os perfis de acesso disponíveis no sistema (Role-Based Access Control - RBAC)
export type Perfil = "admin" | "associado";

/**
 * Entidade de Domínio principal para Usuários, representando 
 * a estrutura completa persistida na base de dados relacional.
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: Perfil;
  criado_em: string;
}

// Data Transfer Object (DTO) sanitizado: omite campos sensíveis (como hashes de senha) para exposição segura em APIs públicas
export type UsuarioPublico = Omit<Usuario, "senha_hash">;

/**
 * Contrato de payload exigido para a criação de um novo registro de usuário,
 * desprovido de campos gerados automaticamente pela infraestrutura (id, criado_em).
 */
export interface NovoUsuario {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: Perfil;
}