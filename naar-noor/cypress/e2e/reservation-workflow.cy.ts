/// <reference types="cypress" />
import { interceptChefs, interceptReservationCreate } from '../support/db-isolation';
import { ReservationPage } from '../support/page-objects/ReservationPage';

/**
 * Reservation Workflow E2E Tests
 *
 * DB_AVAILABLE = true  → passthrough intercepts; real chefs & reservations API
 * DB_AVAILABLE = false → fixture stubs (chefs.json / reservation.json)
 *
 * Cleanup: afterEach removes reservations created for demo@example.com.
 */
describe('Reservation Workflow E2E Tests', () => {
  beforeEach(() => {
    interceptChefs();
  });

  afterEach(() => {
    cy.cleanupAfterTest('demo@example.com');
  });

  // ── Unauthenticated ──────────────────────────────────────────────────────────
  describe('Unauthenticated access', () => {
    beforeEach(() => {
      cy.visit('/reservations');
      cy.wait('@getChefs');
    });

    it('should display the reservations page', () => {
      cy.title().should('contain', 'Reservations');
    });

    it('can be reached via header nav link', () => {
      cy.visit('/');
      cy.contains('Reservations').click();
      cy.url().should('include', '/reservations');
    });

    it('should display chef preview cards', () => {
      cy.get('[data-cy="chef-card"]').should('have.length.at.least', 1);
    });

    it('should show a sign-in prompt for unauthenticated users', () => {
      cy.contains(/sign in/i).should('be.visible');
    });

    it('should NOT show the booking form when not signed in', () => {
      cy.get('[data-cy="chef-details"]').should('not.exist');
    });
  });

  // ── Authenticated — Chef Selection ──────────────────────────────────────────
  describe('Authenticated — chef selection', () => {
    beforeEach(() => {
      cy.visitAuthenticated('/reservations');
      cy.wait('@getChefs');
    });

    it('should display the chef list', () => {
      cy.get('[data-cy="chef-list"]').should('exist');
      cy.get('[data-cy="chef-card"]').should('have.length.at.least', 1);
    });

    it('should show chef details / booking form after selecting a chef', () => {
      cy.get('[data-cy="chef-card"]').first().click();
      cy.get('[data-cy="chef-details"]').should('exist');
    });

    it('should highlight the selected chef card', () => {
      cy.get('[data-cy="chef-card"]').first().click();
      cy.get('[data-cy="chef-card"]').first()
        .should('have.class', 'border-[#C65A1E]');
    });

    it('should switch selection when clicking a different chef', () => {
      cy.get('[data-cy="chef-card"]').first().click();
      cy.get('[data-cy="chef-card"]').eq(1).click();
      cy.get('[data-cy="chef-details"]').should('exist');
    });
  });

  // ── Authenticated — Booking Form ─────────────────────────────────────────────
  describe('Authenticated — booking form', () => {
    beforeEach(() => {
      interceptReservationCreate();
      cy.visitAuthenticated('/reservations');
      cy.wait('@getChefs');
      cy.get('[data-cy="chef-card"]').first().click();
      cy.get('[data-cy="chef-details"]').should('exist');
    });

    it('should display all booking form fields', () => {
      ReservationPage.getDateInput().should('exist');
      ReservationPage.getTimeInput().should('exist');
      ReservationPage.getGuestCountInput().should('exist');
    });

    it('should enable submit button after filling all required fields', () => {
      ReservationPage.setDate('2026-08-15');
      ReservationPage.setTime('19:00');
      ReservationPage.setGuestCount(4);
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should accept an optional special-requests field', () => {
      ReservationPage.setDate('2026-08-15');
      ReservationPage.setTime('19:00');
      ReservationPage.setGuestCount(4);
      ReservationPage.setSpecialRequests('Window seat preferred');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should show confirmation screen after successful submission', () => {
      ReservationPage.setDate('2026-08-15');
      ReservationPage.setTime('19:00');
      ReservationPage.setGuestCount(2);
      cy.get('button[type="submit"]').click();
      cy.wait('@createReservation');
      ReservationPage.verifyConfirmation();
    });

    it('should display a confirmation number', () => {
      ReservationPage.setDate('2026-08-15');
      ReservationPage.setTime('19:00');
      ReservationPage.setGuestCount(2);
      cy.get('button[type="submit"]').click();
      cy.wait('@createReservation');
      cy.get('[data-cy="reservation-confirmation"]').should('exist');
      ReservationPage.getConfirmationNumber().should('exist');
    });

    it('should allow making another reservation from the confirmation screen', () => {
      ReservationPage.setDate('2026-08-15');
      ReservationPage.setTime('19:00');
      ReservationPage.setGuestCount(2);
      cy.get('button[type="submit"]').click();
      cy.wait('@createReservation');
      cy.get('[data-cy="reservation-confirmation"]').should('exist');
      cy.contains(/book again|make another|new reservation/i).click();
      cy.get('[data-cy="chef-list"]').should('exist');
    });
  });

  // ── Authenticated — Validation ───────────────────────────────────────────────
  describe('Authenticated — form validation', () => {
    beforeEach(() => {
      cy.visitAuthenticated('/reservations');
      cy.wait('@getChefs');
      cy.get('[data-cy="chef-card"]').first().click();
      cy.get('[data-cy="chef-details"]').should('exist');
    });

    it('should show date-required error when submitting without a date', () => {
      cy.get('button[type="submit"]').click();
      cy.get('[data-cy="error-date"]').should('contain', 'required');
    });

    it('should show time-required error when submitting without a time', () => {
      cy.get('button[type="submit"]').click();
      cy.get('[data-cy="error-time"]').should('contain', 'required');
    });

    it('should show an error for past dates', () => {
      ReservationPage.setDate('2020-01-01');
      ReservationPage.setTime('10:00');
      cy.get('[data-cy="error-date"]').should('contain.text', 'future');
    });

    it('should show an error when guest count is below minimum', () => {
      ReservationPage.getGuestCountInput().clear().type('0');
      cy.get('[data-cy="error-guestCount"]').should('contain.text', '1');
    });

    it('should show an error when guest count exceeds maximum', () => {
      ReservationPage.getGuestCountInput().clear().type('51');
      cy.get('[data-cy="error-guestCount"]').should('contain.text', '50');
    });
  });
});
