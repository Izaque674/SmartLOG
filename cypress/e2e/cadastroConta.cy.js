describe('Cadastro de Conta', () => {
  it('deve cadastrar uma nova conta com sucesso', () => {
    cy.visit('/register'); // ou a rota correta do seu formulário de cadastro

    // Preenche os campos do formulário
    cy.get('input[placeholder="Seu nome"]').type('Izaque')

    cy.get('input[name="email"]').type('teste' + Date.now() + '@exemplo.com');
    cy.get('input[name="senha"]').type('SenhaSegura123');
    cy.get('input[name="confirmarSenha"]').type('SenhaSegura123');

    // Clica no botão de cadastro
    cy.get('button[type="submit"]').click();

    // Verifica se aparece mensagem de sucesso ou se foi redirecionado
    cy.contains('Cadastro realizado com sucesso').should('be.visible');
    // ou verifica se está na tela de login
    // cy.url().should('include', '/login');
  });
});
