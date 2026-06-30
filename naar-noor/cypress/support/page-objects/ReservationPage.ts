/**
 * ReservationPage Page Object
 * Encapsulates UI interactions for the reservation booking workflow.
 *
 * The booking form uses Angular Reactive Forms with formControlName.
 * Angular does NOT add a `name` attribute for reactive controls, so we
 * select by input type or formControlName attribute:
 *
 *   [formControlName="date"]         → input[type="date"]
 *   [formControlName="time"]         → input[type="time"]
 *   [formControlName="guestCount"]   → input[type="number"]
 *   [formControlName="specialRequests"] → input[type="text"]
 *
 * The form is only visible after selecting a chef AND being authenticated.
 * Use cy.visitAuthenticated('/reservations') in beforeEach.
 */

export class ReservationPage {
  static visit() {
    cy.visit('/reservations');
  }

  static visitAuthenticated(email?: string) {
    cy.visitAuthenticated('/reservations', email);
  }

  static getChefCard(index = 0) {
    return cy.get('[data-cy="chef-card"]').eq(index);
  }

  static selectChef(index = 0) {
    this.getChefCard(index).click();
  }

  static getDateInput() {
    return cy.get('[formControlName="date"]');
  }

  static getTimeInput() {
    return cy.get('[formControlName="time"]');
  }

  static getGuestCountInput() {
    return cy.get('[formControlName="guestCount"]');
  }

  static getSpecialRequestsInput() {
    return cy.get('[formControlName="specialRequests"]');
  }

  static setDate(date: string) {
    this.getDateInput().clear().type(date);
  }

  static setTime(time: string) {
    this.getTimeInput().clear().type(time);
  }

  static setGuestCount(count: number) {
    this.getGuestCountInput().clear().type(count.toString());
  }

  static setSpecialRequests(requests: string) {
    this.getSpecialRequestsInput().clear().type(requests);
  }

  static submitReservation() {
    cy.get('button[type="submit"]').click();
  }

  static verifyConfirmation() {
    cy.get('[data-cy="reservation-confirmation"]').should('exist');
    cy.contains(/reservation confirmed/i).should('exist');
  }

  static getConfirmationNumber() {
    return cy.get('[data-cy="confirmation-number"]');
  }

  static verifyErrorMessage(field: string, message: string) {
    cy.get(`[data-cy="error-${field}"]`).should('contain', message);
  }

  static completeReservation(
    date: string,
    time: string,
    guestCount: number,
    requests?: string
  ) {
    this.setDate(date);
    this.setTime(time);
    this.setGuestCount(guestCount);
    if (requests) {
      this.setSpecialRequests(requests);
    }
    this.submitReservation();
    this.verifyConfirmation();
  }
}
