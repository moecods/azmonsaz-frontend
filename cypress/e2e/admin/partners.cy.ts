describe('Admin Partners', () => {
  beforeEach(() => {
    cy.logout();
    cy.fixture('auth').then((auth: { admin: { phone: string; password: string } }) => {
      if (auth.admin?.phone && auth.admin?.password) {
        cy.login(auth.admin.phone, auth.admin.password);
      } else {
        cy.login();
      }
    });
    cy.visit('/admin/partners');
  });

  it('shows partners section and add button', () => {
    cy.getByTestId('admin-nav-partners').should('have.attr', 'aria-current', 'page');
    cy.getByTestId('admin-add-partner').should('be.visible');
  });

  it('opens create partner dialog when clicking add', () => {
    cy.getByTestId('admin-add-partner').click();
    cy.contains('ایجاد شریک جدید').should('be.visible');
    cy.contains('نام شریک').should('be.visible');
  });

  it('lists partners when API returns data', () => {
    cy.contains('مدیریت شرکا').should('be.visible');
    cy.get('table').should('exist');
  });
});
