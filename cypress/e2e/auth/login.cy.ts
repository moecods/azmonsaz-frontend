describe('Login', () => {
  beforeEach(() => {
    cy.logout();
  });

  it('shows login form and password tab by default', () => {
    cy.visit('/login');
    cy.getByTestId('login-phone').should('be.visible');
    cy.getByTestId('login-password').should('be.visible');
    cy.getByTestId('login-submit').should('be.visible').and('contain', 'ورود');
  });

  it('validates empty submit', () => {
    cy.visit('/login');
    cy.getByTestId('login-submit').click();
    // Form validation may show messages or prevent submit; URL stays on login
    cy.url().should('include', '/login');
  });

  it('shows error on invalid credentials', () => {
    cy.visit('/login');
    cy.getByTestId('login-phone').clear().type('09121111111');
    cy.getByTestId('login-password').clear().type('wrongpassword');
    cy.getByTestId('login-submit').click();
    // Backend returns 401 or error message
    cy.get('[data-cy="login-error"]', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('logs in successfully with valid credentials and redirects to dashboard', () => {
    // Requires backend with matching user in auth.json (or stub in CI)
    cy.login('09123456789', 'password123');
    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.a('string').and.not.be.empty;
    });
  });

  it('can use fixture credentials when calling login() with no args', () => {
    // Same as above but via fixture; ensure auth.json has valid creds for your backend
    cy.login();
    cy.url().should('include', '/dashboard');
  });
});
