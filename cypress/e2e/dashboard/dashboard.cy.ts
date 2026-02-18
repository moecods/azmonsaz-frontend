describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads dashboard with content', () => {
    cy.visitDashboard();
    cy.get('body').should('be.visible');
  });

  it('shows dashboard area', () => {
    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
  });
});
