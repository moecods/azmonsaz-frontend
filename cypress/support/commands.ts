/// <reference types="cypress" />

/**
 * Get element by data-cy attribute (stable selector for E2E).
 */
Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-cy="${id}"]`);
});

/**
 * Login via password form. Visits /login, fills phone and password, submits.
 * Asserts redirect away from login and presence of auth_token in localStorage.
 * Pass credentials or omit to use fixture auth.json (phone + password).
 */
Cypress.Commands.add(
  'login',
  (phone?: string, password?: string) => {
    cy.visit('/login');
    if (phone != null && password != null) {
      cy.getByTestId('login-phone').clear().type(phone);
      cy.getByTestId('login-password').clear().type(password);
    } else {
      cy.fixture('auth').then((auth: { phone: string; password: string }) => {
        cy.getByTestId('login-phone').clear().type(auth.phone);
        cy.getByTestId('login-password').clear().type(auth.password);
      });
    }
    cy.getByTestId('login-submit').click();
    cy.url().should('not.include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.a('string').and.not.be.empty;
    });
  }
);

/**
 * Logout: clear token and optionally visit home so UI state resets.
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
  });
  cy.visit('/');
});

/**
 * Visit dashboard when already authenticated (token in localStorage).
 */
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/dashboard');
  cy.url().should('include', '/dashboard');
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
      login(phone?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      visitDashboard(): Chainable<void>;
    }
  }
}

export {};
