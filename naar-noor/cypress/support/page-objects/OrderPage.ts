/**
 * OrderPage Page Object
 * Encapsulates UI interactions for the checkout / order placement workflow.
 *
 * The checkout form uses:
 *   input[name="customerName"]   — customer name
 *   input[name="email"]          — email
 *   input[name="phone"]          — phone number
 *   textarea[name="address"]     — delivery address (only shown for delivery orders)
 *   select[name="orderType"]     — order type (delivery | pickup | dine-in)
 *
 * Submitting calls POST /api/payments/create-checkout-session which returns
 * { url } and redirects the browser.  Tests stub this endpoint so
 * verifyOrderConfirmation() checks the URL changed to /payment-success.
 */

export class OrderPage {
  static visit() {
    cy.visit('/checkout');
  }

  static getCartItems() {
    return cy.get('[data-cy="cart-item"]');
  }

  static getQuantityInput(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('input[type="number"]');
  }

  static getItemPrice(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('[data-cy="item-price"]');
  }

  static getRemoveButton(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('button').contains('Remove');
  }

  static getOrderTotal() {
    return cy.get('[data-cy="order-total"]');
  }

  static getNameInput() {
    return cy.get('input[name="customerName"]');
  }

  static getEmailInput() {
    return cy.get('input[name="email"]');
  }

  static getPhoneInput() {
    return cy.get('input[name="phone"]');
  }

  static getAddressInput() {
    return cy.get('textarea[name="address"]');
  }

  static getOrderTypeSelect() {
    return cy.get('select[name="orderType"]');
  }

  /** The submit button redirects to Stripe (or the stubbed payment URL). */
  static getPlaceOrderButton() {
    return cy.get('button').contains('Pay with Stripe');
  }

  static changeQuantity(itemIndex: number, quantity: number) {
    this.getQuantityInput(itemIndex).clear().type(quantity.toString());
  }

  static removeItem(itemIndex: number) {
    this.getRemoveButton(itemIndex).click();
  }

  static selectOrderType(type: 'delivery' | 'pickup' | 'dine-in') {
    this.getOrderTypeSelect().select(type);
  }

  static enterCustomerDetails(name: string, email: string, phone: string) {
    this.getNameInput().type(name);
    this.getEmailInput().type(email);
    this.getPhoneInput().type(phone);
  }

  static enterDeliveryAddress(address: string) {
    this.getAddressInput().type(address);
  }

  static completeOrder(name: string, email: string, phone: string, address?: string) {
    this.enterCustomerDetails(name, email, phone);
    if (address) {
      this.enterDeliveryAddress(address);
    }
    this.getPlaceOrderButton().click();
  }

  static verifyCartItemCount(count: number) {
    this.getCartItems().should('have.length', count);
  }

  static verifyTotal(total: string) {
    this.getOrderTotal().should('contain', total);
  }

  /**
   * After a successful Stripe session creation the browser is redirected to
   * /payment-success (via the stubbed fixture).
   */
  static verifyOrderConfirmation() {
    cy.url().should('include', '/payment-success');
  }

  static getOrderReference() {
    return cy.get('[data-cy="order-reference"]');
  }

  static verifyErrorMessage(message: string) {
    cy.contains(message).should('be.visible');
  }
}
