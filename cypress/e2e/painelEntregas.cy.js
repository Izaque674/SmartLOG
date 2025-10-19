// cypress/e2e/painelEntregas.cy.js
describe('Painel de Entregas', () => {
  it('deve exibir o botão de iniciar jornada', () => {
    cy.visit('/');
    cy.contains('INICIAR DIA DE ENTREGAS').should('be.visible');
  });
});