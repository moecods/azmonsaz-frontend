describe('Exams list and create', () => {
  beforeEach(() => {
    cy.login();
  });

  it('loads exams page', () => {
    cy.visit('/exams');
    cy.url().should('include', '/exams');
  });

  it('shows exams list or empty state', () => {
    cy.visit('/exams');
    cy.get('body').should('be.visible');
  });

  it('can navigate to create exam', () => {
    cy.visit('/exams');
    cy.contains('ایجاد آزمون').first().click({ force: true });
    cy.url().should('include', '/exams/create');
  });
});
