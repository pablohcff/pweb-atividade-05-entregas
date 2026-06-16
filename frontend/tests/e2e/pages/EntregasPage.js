// frontend/tests/e2e/pages/EntregasPage.js
// RF-06: Page Object Model para a listagem de entregas (/painel/entregas).
// Encapsula seletores e ações, usando data-testid como estratégia primária.

export class EntregasPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Seletores baseados em data-testid (estratégia primária — RF-06)
    this.tabelaEntregas = page.getByTestId('tabela-entregas');
    this.linhasEntrega  = page.getByTestId('linha-entrega');
    this.btnSair        = page.getByTestId('btn-sair');
  }

  /** Navega para a listagem de entregas. */
  async navegar() {
    await this.page.goto('/painel/entregas');
  }

  /** Clica no botão Sair e aguarda o redirecionamento. */
  async sair() {
    await this.btnSair.click();
  }
}
