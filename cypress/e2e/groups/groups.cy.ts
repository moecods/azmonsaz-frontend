describe('Groups', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads groups page', () => {
    cy.visit('/groups');
    cy.url().should('include', '/groups');
  });

  it('shows groups content', () => {
    cy.visit('/groups');
    cy.get('body').should('be.visible');
  });
});
