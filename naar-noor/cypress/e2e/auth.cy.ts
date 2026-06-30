/// <reference types="cypress" />
import { interceptAuth, interceptLogout } from '../support/db-isolation';
import { LoginPage } from '../support/page-objects/LoginPage';

/**
 * Authentication E2E Tests
 *
 * Auth is ALWAYS stubbed — never hits real Supabase credentials.
 * interceptAuth() and interceptLogout() are thin wrappers around cy.intercept()
 * for clarity, consistent with the dual-mode pattern used everywhere else.
 *
 * Logged-in state: [data-user-menu] exists in the header.
 * Logged-out state: [data-user-menu] does not exist.
 */

const VALID_EMAIL    = 'demo@example.com';
const VALID_PASSWORD = 'password123';

describe('Authentication E2E Tests', () => {
  describe('Login Workflow', () => {
    beforeEach(() => {
      interceptAuth('success');
      LoginPage.visit();
    });

    it('should display the login page', () => {
      cy.title().should('contain', 'Login');
    });

    it('should show email and password fields', () => {
      LoginPage.getEmailInput().should('exist');
      LoginPage.getPasswordInput().should('exist');
    });

    it('should show the submit button', () => {
      LoginPage.getLoginButton().should('exist');
    });

    it('should login successfully with valid credentials', () => {
      LoginPage.login(VALID_EMAIL, VALID_PASSWORD);
      cy.wait('@login');
      LoginPage.verifyLoggedIn();
    });

    it('should reject invalid credentials', () => {
      interceptAuth('failure', 'loginFail');
      LoginPage.login('wrong@example.com', 'wrongpassword');
      cy.wait('@loginFail');
      LoginPage.verifyErrorMessage('Invalid credentials');
    });

    it('should show error when email field is empty', () => {
      LoginPage.enterPassword(VALID_PASSWORD);
      LoginPage.getLoginButton().click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should show error when password field is empty', () => {
      LoginPage.enterEmail(VALID_EMAIL);
      LoginPage.getLoginButton().click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should show email-format error for invalid email', () => {
      LoginPage.getEmailInput().type('not-an-email').blur();
      cy.contains('email', { matchCase: false }).should('be.visible');
    });
  });

  describe('Logout Workflow', () => {
    beforeEach(() => {
      interceptAuth('success');
      interceptLogout();
      LoginPage.visit();
      LoginPage.login(VALID_EMAIL, VALID_PASSWORD);
      cy.wait('@login');
      LoginPage.verifyLoggedIn();
    });

    it('should logout successfully', () => {
      LoginPage.clickLogout();
      LoginPage.verifyLoggedOut();
    });

    it('should hide the user-menu after logout', () => {
      LoginPage.clickLogout();
      cy.get('[data-user-menu]').should('not.exist');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      interceptAuth('success');
    });

    it('should persist session on page refresh', () => {
      LoginPage.visit();
      LoginPage.login(VALID_EMAIL, VALID_PASSWORD);
      cy.wait('@login');
      LoginPage.verifyLoggedIn();
      cy.reload();
      LoginPage.verifyLoggedIn();
    });

    it('should persist session across navigation', () => {
      LoginPage.visit();
      LoginPage.login(VALID_EMAIL, VALID_PASSWORD);
      cy.wait('@login');
      cy.intercept('GET', '/api/menu*').as('getMenuNav');
      cy.visit('/menu');
      LoginPage.verifyLoggedIn();
    });

    it('should clear session data after logout', () => {
      interceptLogout();
      LoginPage.visit();
      LoginPage.login(VALID_EMAIL, VALID_PASSWORD);
      cy.wait('@login');
      LoginPage.clickLogout();
      cy.reload();
      LoginPage.verifyLoggedOut();
    });
  });
});
