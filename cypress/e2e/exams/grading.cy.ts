describe('Exam grading', () => {
  beforeEach(() => {
    cy.login();
  });

  it('grading page loads with exam id in URL', () => {
    cy.visit('/exams/1/grading');
    cy.url().should('include', '/grading');
  });
});
