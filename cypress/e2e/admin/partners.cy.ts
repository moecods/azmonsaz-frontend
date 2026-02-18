describe('Admin Partners', () => {
  beforeEach(() => {
    cy.logout();
    // Login as admin (use fixture admin credentials; backend must have this user)
    cy.fixture('auth').then((auth: { admin: { phone: string; password: string } }) => {
      if (auth.admin?.phone && auth.admin?.password) {
        cy.login(auth.admin.phone, auth.admin.password);
      } else {
        cy.login();
      }
    });
    cy.visit('/admin');
  });

  it('shows partners tab and add button', () => {
    cy.getByTestId('admin-tab-partners').should('be.visible');
    cy.getByTestId('admin-add-partner').should('be.visible');
  });

  it('opens create partner dialog when clicking add', () => {
    cy.getByTestId('admin-add-partner').click();
    cy.contains('ایجاد شریک جدید').should('be.visible');
    cy.contains('نام شریک').should('be.visible');
  });

  it('lists partners when API returns data', () => {
    cy.contains('مدیریت شرکا').should('be.visible');
    // Either table with rows or empty state
    cy.get('table').should('exist');
  });
});
