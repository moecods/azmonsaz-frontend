describe('Reset Password', () => {
  it('loads reset password page', () => {
    cy.visit('/reset-password');
    cy.url().should('include', '/reset-password');
    cy.contains('تنظیم مجدد رمز عبور').should('be.visible');
  });

  it('shows form fields for code and new password', () => {
    cy.visit('/reset-password');
    cy.get('input[name="code"], input[type="text"]').first().should('exist');
    cy.get('input[type="password"]').should('have.length.at.least', 1);
  });
});
