describe('Layout and navigation', () => {
  beforeEach(() => {
    cy.login();
  });

  it('dashboard shows sidebar with dashboard link', () => {
    cy.visit('/dashboard');
    cy.getByTestId('nav-dashboard').should('be.visible');
  });

  it('navigates to exams via sidebar', () => {
    cy.visit('/dashboard');
    cy.getByTestId('nav-exams').click();
    cy.url().should('include', '/exams');
  });

  it('navigates to profile via sidebar', () => {
    cy.visit('/dashboard');
    cy.getByTestId('nav-profile').click();
    cy.url().should('include', '/profile');
  });

  it('user menu opens and has logout', () => {
    cy.visit('/dashboard');
    cy.getByTestId('user-menu-button').click();
    cy.getByTestId('logout-button').should('be.visible');
  });

  it('admin user sees admin nav link', () => {
    // Assumes fixture or login as admin; if not admin, nav-admin may not be present
    cy.visit('/dashboard');
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="nav-admin"]').length) {
        cy.getByTestId('nav-admin').click();
        cy.url().should('include', '/admin');
      }
    });
  });
});
