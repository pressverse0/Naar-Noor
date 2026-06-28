/**
 * LoginPage Page Object
 * Encapsulates UI interactions for authentication workflows
 */

export class LoginPage {
  /**
   * Navigate to login page
   */
  static visit() {
    cy.visit('/login');
  }

  /**
   * Get email input field
   */
  static getEmailInput() {
    return cy.get('input[type="email"]');
  }

  /**
   * Get password input field
   */
  static getPasswordInput() {
    return cy.get('input[type="password"]');
  }

  /**
   * Get login button
   */
  static getLoginButton() {
    return cy.get('button[type="submit"]').contains('Login');
  }

  /**
   * Get logout button
   */
  static getLogoutButton() {
    return cy.get('button').contains('Logout');
  }

  /**
   * Enter email
   */
  static enterEmail(email: string) {
    this.getEmailInput().type(email);
  }

  /**
   * Enter password
   */
  static enterPassword(password: string) {
    this.getPasswordInput().type(password);
  }

  /**
   * Click login button
   */
  static clickLogin() {
    this.getLoginButton().click();
  }

  /**
   * Click logout button
   */
  static clickLogout() {
    this.getLogoutButton().click();
  }

  /**
   * Login with credentials
   */
  static login(email: string, password: string) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickLogin();
  }

  /**
   * Verify error message appears
   */
  static verifyErrorMessage(message: string) {
    cy.contains(message).should('be.visible');
  }

  /**
   * Verify user is logged in
   */
  static verifyLoggedIn() {
    cy.get('[data-cy="user-menu"]').should('exist');
  }

  /**
   * Verify user is logged out
   */
  static verifyLoggedOut() {
    this.getLoginButton().should('exist');
  }
}
