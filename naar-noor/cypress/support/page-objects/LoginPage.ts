/**
 * LoginPage Page Object
 * Encapsulates UI interactions for authentication workflows.
 *
 * Auth state is reflected by:
 *   Logged IN  → `[data-user-menu]` is visible in the header
 *   Logged OUT → `[data-user-menu]` does not exist
 */

export class LoginPage {
  static visit() {
    cy.visit('/login');
  }

  static getEmailInput() {
    return cy.get('input[type="email"]');
  }

  static getPasswordInput() {
    return cy.get('input[type="password"]');
  }

  static getLoginButton() {
    return cy.get('button[type="submit"]');
  }

  static getLogoutButton() {
    return cy.get('button').contains('Logout');
  }

  static enterEmail(email: string) {
    this.getEmailInput().clear().type(email);
  }

  static enterPassword(password: string) {
    this.getPasswordInput().clear().type(password);
  }

  static clickLogin() {
    this.getLoginButton().click();
  }

  static clickLogout() {
    // The logout button is inside the user-menu dropdown in the header.
    cy.get('[data-user-menu]').click();
    this.getLogoutButton().click();
  }

  static login(email: string, password: string) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickLogin();
  }

  static verifyErrorMessage(message: string) {
    cy.contains(message).should('be.visible');
  }

  /** User is logged in when the header shows the avatar / user-menu container. */
  static verifyLoggedIn() {
    cy.get('[data-user-menu]').should('exist');
  }

  /** User is logged out when the user-menu container is gone. */
  static verifyLoggedOut() {
    cy.get('[data-user-menu]').should('not.exist');
  }
}
