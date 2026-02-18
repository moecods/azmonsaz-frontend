describe('Protected routes', () => {
  beforeEach(() => {
    cy.logout();
  });

  const protectedPaths = ['/dashboard', '/admin', '/exams', '/questions', '/profile', '/exams/create'];

  protectedPaths.forEach((path) => {
    it(`redirects unauthenticated user from ${path} to /login`, () => {
      cy.visit(path);
      cy.url().should('include', '/login');
    });
  });

  it('allows authenticated user to access dashboard', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('allows authenticated user to access profile', () => {
    cy.login();
    cy.visit('/profile');
    cy.url().should('include', '/profile');
  });

  it('allows authenticated user to access exams list', () => {
    cy.login();
    cy.visit('/exams');
    cy.url().should('include', '/exams');
  });
});
