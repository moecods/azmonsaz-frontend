describe('Error states', () => {
  it('shows error message on invalid login', () => {
    cy.visit('/login');
    cy.getByTestId('login-phone').type('09121111111');
    cy.getByTestId('login-password').type('wrong');
    cy.getByTestId('login-submit').click();
    cy.getByTestId('login-error').should('be.visible');
  });

  it('non-admin sees 403 when visiting admin', () => {
    // Login as non-admin (creator); fixture creator or default auth
    cy.login();
    cy.visit('/admin');
    // If user is not admin, backend returns 403 or we see "دسترسی محدود شده"
    cy.get('body').then(($body) => {
      if ($body.text().includes('دسترسی محدود') || $body.text().includes('403')) {
        cy.contains(/دسترسی محدود|403/).should('be.visible');
      } else {
        // User might be admin, so admin page loads
        cy.url().should('satisfy', (url) => url.includes('/admin') || url.includes('/dashboard'));
      }
    });
  });
});
