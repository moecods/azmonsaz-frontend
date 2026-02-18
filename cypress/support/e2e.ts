// Import commands and ensure they are registered
import './commands';

// Clear localStorage between specs to avoid auth leakage (unless a test needs to preserve it)
beforeEach(() => {
  // Only clear if we're starting a new spec; Cypress runs each spec in a fresh browser context by default when not preserving
  // We don't clear here so that tests that call cy.login() in before() can run multiple it() without re-login.
  // Tests that need unauthenticated state should call cy.logout() or visit /login.
});

// Ignore uncaught exceptions from third-party scripts or non-critical errors that would fail specs
Cypress.on('uncaught:exception', (err) => {
  // ResizeObserver, or other benign errors
  if (err.message?.includes('ResizeObserver') || err.message?.includes('Script error')) {
    return false;
  }
  return true;
});
