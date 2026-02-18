describe('Profile', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads profile page', () => {
    cy.visit('/profile');
    cy.url().should('include', '/profile');
  });

  it('shows profile content', () => {
    cy.visit('/profile');
    cy.get('body').should('be.visible');
  });
});
