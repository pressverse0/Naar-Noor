/**
 * OrderPage Page Object
 * Encapsulates UI interactions for order placement workflow
 */

export class OrderPage {
  /**
   * Navigate to checkout/order page
   */
  static visit() {
    cy.visit('/checkout');
  }

  /**
   * Get cart items list
   */
  static getCartItems() {
    return cy.get('[data-cy="cart-item"]');
  }

  /**
   * Get item quantity input
   */
  static getQuantityInput(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('input[type="number"]');
  }

  /**
   * Get item price
   */
  static getItemPrice(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('[data-cy="item-price"]');
  }

  /**
   * Get remove button
   */
  static getRemoveButton(itemIndex: number) {
    return cy.get('[data-cy="cart-item"]').eq(itemIndex).find('button').contains('Remove');
  }

  /**
   * Get order total
   */
  static getOrderTotal() {
    return cy.get('[data-cy="order-total"]');
  }

  /**
   * Get customer name input
   */
  static getNameInput() {
    return cy.get('input[name="customerName"]');
  }

  /**
   * Get email input
   */
  static getEmailInput() {
    return cy.get('input[name="email"]');
  }

  /**
   * Get phone input
   */
  static getPhoneInput() {
    return cy.get('input[name="phone"]');
  }

  /**
   * Get delivery address input
   */
  static getAddressInput() {
    return cy.get('textarea[name="address"]');
  }

  /**
   * Get order type select
   */
  static getOrderTypeSelect() {
    return cy.get('select[name="orderType"]');
  }

  /**
   * Get place order button
   */
  static getPlaceOrderButton() {
    return cy.get('button').contains('Place Order');
  }

  /**
   * Change item quantity
   */
  static changeQuantity(itemIndex: number, quantity: number) {
    this.getQuantityInput(itemIndex).clear().type(quantity.toString());
  }

  /**
   * Remove item from cart
   */
  static removeItem(itemIndex: number) {
    this.getRemoveButton(itemIndex).click();
  }

  /**
   * Select order type
   */
  static selectOrderType(type: 'delivery' | 'pickup' | 'dine-in') {
    this.getOrderTypeSelect().select(type);
  }

  /**
   * Enter customer details
   */
  static enterCustomerDetails(name: string, email: string, phone: string) {
    this.getNameInput().type(name);
    this.getEmailInput().type(email);
    this.getPhoneInput().type(phone);
  }

  /**
   * Enter delivery address
   */
  static enterDeliveryAddress(address: string) {
    this.getAddressInput().type(address);
  }

  /**
   * Complete order
   */
  static completeOrder(
    name: string,
    email: string,
    phone: string,
    address?: string
  ) {
    this.enterCustomerDetails(name, email, phone);
    if (address) {
      this.enterDeliveryAddress(address);
    }
    this.getPlaceOrderButton().click();
  }

  /**
   * Verify cart item count
   */
  static verifyCartItemCount(count: number) {
    this.getCartItems().should('have.length', count);
  }

  /**
   * Verify total matches
   */
  static verifyTotal(total: string) {
    this.getOrderTotal().should('contain', total);
  }

  /**
   * Verify order confirmation
   */
  static verifyOrderConfirmation() {
    cy.get('[data-cy="order-confirmation"]').should('exist');
  }

  /**
   * Get order reference number
   */
  static getOrderReference() {
    return cy.get('[data-cy="order-reference"]');
  }

  /**
   * Verify error message
   */
  static verifyErrorMessage(message: string) {
    cy.contains(message).should('be.visible');
  }
}
