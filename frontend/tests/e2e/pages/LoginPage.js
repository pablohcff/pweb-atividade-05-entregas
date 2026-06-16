// frontend/tests/e2e/pages/LoginPage.js
// RF-06: Page Object Model para a tela de login (/login).
// Encapsula todos os seletores e ações, usando data-testid como estratégia primária.

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Seletores baseados em data-testid (estratégia primária — RF-06)
    this.inputEmail     = page.getByTestId('input-email');
    this.inputSenha     = page.getByTestId('input-senha');
    this.btnEntrar      = page.getByTestId('btn-entrar');
    this.mensagemErro   = page.getByTestId('mensagem-erro');
  }

  /** Navega para a página de login. */
  async navegar() {
    await this.page.goto('/login');
  }

  /**
   * Preenche o formulário e submete.
   * @param {string} email
   * @param {string} senha
   */
  async login(email, senha) {
    await this.inputEmail.fill(email);
    await this.inputSenha.fill(senha);
    await this.btnEntrar.click();
  }
}
