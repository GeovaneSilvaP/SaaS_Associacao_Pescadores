/**
 * Classe customizada para gerenciar erros operacionais esperados na aplicação.
 * Herda da classe nativa Error do JavaScript/TypeScript.
 */
export class AppError extends Error {
  /**
   * Construtor da classe AppError.
   * @param message Mensagem descritiva do erro que ocorreu.
   * @param statusCode Código de status HTTP associado ao erro (padrão é 400 - Bad Request).
   */
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    // Repassa a mensagem de erro para o construtor da classe pai (Error)
    super(message);

    // Define o nome do erro explicitamente para facilitar identificação nos logs
    this.name = "AppError";
  }
}
