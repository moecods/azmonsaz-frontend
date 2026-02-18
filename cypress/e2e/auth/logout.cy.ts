describe('Logout', () => {
  it('after login, token is set; after logout, token is cleared', () => {
    cy.login('09123456789', 'password123');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).not.to.be.empty;
    });
    cy.logout();
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
    });
  });

  it('visiting protected page after logout redirects to login', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.logout();
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
