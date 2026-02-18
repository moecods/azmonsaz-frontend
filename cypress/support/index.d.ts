/// <reference types="cypress" />

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
