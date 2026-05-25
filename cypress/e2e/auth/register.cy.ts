describe('Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('shows register form with all fields', () => {
    cy.getByTestId('register-name').should('be.visible');
    cy.getByTestId('register-phone').should('be.visible');
    cy.getByTestId('register-password').should('be.visible');
    cy.getByTestId('register-password-confirmation').should('be.visible');
    cy.getByTestId('register-submit').should('be.visible').and('contain', 'ثبت‌نام');
  });

  it('validates required fields on empty submit', () => {
    cy.getByTestId('register-submit').click();
    cy.url().should('include', '/register');
  });

  it('has link to login page', () => {
    cy.contains('وارد شوید').should('have.attr', 'href', '/login');
  });

  it('registers successfully when backend accepts', () => {
    // Use unique phone to avoid duplicate; requires backend to allow registration
    const phone = `0912${Date.now().toString().slice(-7)}`;
    cy.getByTestId('register-name').type('Test User');
    cy.getByTestId('register-phone').type(phone);
    cy.getByTestId('register-password').type('password123');
    cy.getByTestId('register-password-confirmation').type('password123');
    cy.getByTestId('register-submit').click();
    // On success, redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 });
  });
});
