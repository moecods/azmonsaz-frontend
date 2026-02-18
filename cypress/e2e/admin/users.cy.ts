describe('Admin Users', () => {
  beforeEach(() => {
    cy.logout();
    cy.fixture('auth').then((auth: { admin?: { phone: string; password: string } }) => {
      if (auth.admin?.phone && auth.admin?.password) {
        cy.login(auth.admin.phone, auth.admin.password);
      } else {
        cy.login();
      }
    });
    cy.visit('/admin');
  });

  it('can switch to users tab', () => {
    cy.getByTestId('admin-tab-users').click();
    cy.getByTestId('admin-add-user').should('be.visible');
    cy.contains('مدیریت کاربران').should('be.visible');
  });

  it('opens create user dialog when clicking add user', () => {
    cy.getByTestId('admin-tab-users').click();
    cy.getByTestId('admin-add-user').click();
    cy.contains('ایجاد کاربر جدید').should('be.visible');
  });
});
