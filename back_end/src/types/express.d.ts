import { Perfil } from '../models/Usuario'

/**
 * Declaração de ambientação (Ambient Module) para ampliação de tipos globais do Express.
 * Injeta propriedades customizadas (como o payload do usuário autenticado) 
 * diretamente na interface Request do framework para garantir type-safety em middlewares e controllers.
 */
declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; perfil: Perfil }
    }
  }
}

// Garante que o arquivo seja tratado como um módulo ES Module (evitando conflitos de escopo global)
export {}