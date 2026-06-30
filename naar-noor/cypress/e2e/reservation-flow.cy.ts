/// <reference types="cypress" />
import { interceptChefs, interceptReservationCreate } from '../support/db-isolation';

/**
 * E2E: Reservation Flow
 *
 * DB_AVAILABLE = true  → passthrough intercepts; real chefs & reservations API
 * DB_AVAILABLE = false → fixture stubs (chefs.json / reservation.json)
 *
 * Auth: cy.visitAuthenticated() injects nn_session into localStorage via
 *       onBeforeLoad — this is the ONLY correct way to authenticate.  The
 *       old Supabase-token approach targeted the wrong localStorage key.
 *
 * Cleanup: afterEach removes reservations created for test@example.com.
 *          When DB_AVAILABLE is false, cleanupAfterTest() is a no-op.
 */

// ── A: Unauthenticated visitor ─────────────────────────────────────────────
describe('Reservation Page — unauthenticated', () => {
  beforeEach(() => {
    cy.visit('/reservations');
  });

  it('loads the reservations page', () => {
    cy.url().should('include', '/reservations');
  });

  it('shows the "Sign In to Book a Table" prompt', () => {
    cy.contains('Sign In to Book a Table').should('be.visible');
  });

  it('shows a "Sign In to Continue" call-to-action button', () => {
    cy.contains('button', 'Sign In to Continue').should('be.visible');
  });

  it('shows the "Create a Free Account" link', () => {
    cy.contains('a', 'Create a Free Account').should('be.visible');
  });

  it('shows the three feature preview cards', () => {
    cy.contains('Choose Your Chef').should('be.visible');
    cy.contains('Pick Your Date & Time').should('be.visible');
    cy.contains('Personalised Experience').should('be.visible');
  });

  it('links to the menu from the sign-in gate', () => {
    cy.contains('a', 'View the full menu').click();
    cy.url().should('include', '/menu');
  });

  it('does NOT render the chef list when not logged in', () => {
    cy.get('[data-cy="chef-list"]').should('not.exist');
  });
});

// ── B: Authenticated booking flow ─────────────────────────────────────────
describe('Reservation Page — authenticated booking flow', () => {
  const FUTURE_DATE = '2026-08-20';

  beforeEach(() => {
    interceptChefs();
    interceptReservationCreate();
    // Inject nn_session BEFORE Angular boots (onBeforeLoad).
    cy.visitAuthenticated('/reservations');
    cy.wait('@getChefs');
  });

  afterEach(() => {
    // Remove any reservations created under the test email.
    // cleanupAfterTest() is idempotent and no-ops when DB not available.
    cy.cleanupAfterTest('demo@example.com');
  });

  it('renders the chef list when authenticated', () => {
    cy.get('[data-cy="chef-list"]').should('exist');
    cy.get('[data-cy="chef-card"]').should('have.length.at.least', 1);
  });

  it('shows chef names from the API', () => {
    cy.get('[data-cy="chef-card"]').contains('Arjun Thapa').should('exist');
    cy.get('[data-cy="chef-card"]').contains('Priya Rai').should('exist');
  });

  it('shows chef details panel after selecting a chef', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('[data-cy="chef-details"]').should('be.visible');
  });

  it('shows the chef name inside the details panel', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('[data-cy="chef-details"]').contains('Arjun Thapa').should('be.visible');
  });

  it('highlights the selected chef card', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('[data-cy="chef-card"]').first().should('have.class', 'border-[#C65A1E]');
  });

  it('switches the highlighted chef when a different card is clicked', () => {
    cy.get('[data-cy="chef-card"]').eq(0).click();
    cy.get('[data-cy="chef-card"]').eq(1).click();
    cy.get('[data-cy="chef-details"]').contains('Priya Rai').should('be.visible');
  });

  it('shows a date validation error when a past date is entered', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type('2020-01-01');
    cy.get('input[formControlName="time"]').type('19:00');
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="error-date"]').should('contain', 'future');
  });

  it('shows a time-required error when date is set but time is left empty', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type(FUTURE_DATE);
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="error-time"]').should('contain', 'required');
  });

  it('enables the submit button when all fields are valid', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type(FUTURE_DATE);
    cy.get('input[formControlName="time"]').type('19:00');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('shows the confirmation screen after a successful booking', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type(FUTURE_DATE);
    cy.get('input[formControlName="time"]').type('19:00');
    cy.get('input[formControlName="guestCount"]').clear().type('2');
    cy.get('button[type="submit"]').click();
    cy.wait('@createReservation');
    cy.get('[data-cy="reservation-confirmation"]').should('be.visible');
  });

  it('displays a confirmation number after booking', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type(FUTURE_DATE);
    cy.get('input[formControlName="time"]').type('19:00');
    cy.get('input[formControlName="guestCount"]').clear().type('4');
    cy.get('button[type="submit"]').click();
    cy.wait('@createReservation');
    cy.get('[data-cy="confirmation-number"]').should('contain', '#');
  });

  it('allows making another reservation after the first one', () => {
    cy.get('[data-cy="chef-card"]').first().click();
    cy.get('input[formControlName="date"]').type(FUTURE_DATE);
    cy.get('input[formControlName="time"]').type('20:00');
    cy.get('button[type="submit"]').click();
    cy.wait('@createReservation');
    cy.get('[data-cy="reservation-confirmation"]').should('be.visible');
    cy.contains('button', 'Make Another Reservation').click();
    cy.get('[data-cy="chef-list"]').should('be.visible');
  });
});
