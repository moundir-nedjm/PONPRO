/**
 * Classe pour gérer les réponses d'erreur
 * Étend la classe Error native
 */
class ErrorResponse extends Error {
  /**
   * Constructeur
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP de l'erreur
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse; 