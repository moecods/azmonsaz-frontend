describe('Questions', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads questions page', () => {
    cy.visit('/questions');
    cy.url().should('include', '/questions');
  });

  it('shows questions content', () => {
    cy.visit('/questions');
    cy.get('body').should('be.visible');
  });
});
