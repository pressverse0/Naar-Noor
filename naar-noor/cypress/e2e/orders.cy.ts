/// <reference types="cypress" />
import { interceptMenu, interceptPayment } from '../support/db-isolation';
import { MenuPage } from '../support/page-objects/MenuPage';
import { OrderPage } from '../support/page-objects/OrderPage';

/**
 * Order Workflow E2E Tests
 *
 * DB_AVAILABLE = true  → real menu API; payment always stubbed (no real Stripe)
 * DB_AVAILABLE = false → menu fixture stub; payment stubbed
 *
 * Cleanup: afterEach removes orders for demo@example.com when DB available.
 */
describe('Order Workflow E2E Tests', () => {
  beforeEach(() => {
    interceptMenu();
    interceptPayment();
    cy.visit('/');
  });

  afterEach(() => {
    cy.cleanupAfterTest('demo@example.com');
  });

  describe('Adding Items to Cart', () => {
    it('should add an item to cart from the menu', () => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      cy.get('[data-cy="cart-badge"]').should('contain', '1');
    });

    it('should increment badge when adding multiple different items', () => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      MenuPage.addToCart(1);
      cy.get('[data-cy="cart-badge"]').should('contain', '2');
    });

    it('should show items in cart drawer after adding', () => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="cart-drawer"]').should('be.visible');
      cy.get('[data-cy="cart-badge"]').should('contain', '1');
    });
  });

  describe('Checkout Form — Order Summary', () => {
    beforeEach(() => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      OrderPage.visit();
    });

    it('should show at least one cart item on checkout', () => {
      OrderPage.verifyCartItemCount(1);
    });

    it('should display an order total', () => {
      OrderPage.getOrderTotal().should('exist');
    });

    it('should show a Pay with Stripe button', () => {
      OrderPage.getPlaceOrderButton().should('exist');
    });
  });

  describe('Checkout Form — Order Type', () => {
    beforeEach(() => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      OrderPage.visit();
    });

    it('should show address field when delivery is selected', () => {
      OrderPage.selectOrderType('delivery');
      OrderPage.getAddressInput().should('be.visible');
    });

    it('should show pickup-time element when pickup is selected', () => {
      OrderPage.selectOrderType('pickup');
      cy.get('[data-cy="pickup-time"]').should('exist');
    });

    it('should show table-selection element when dine-in is selected', () => {
      OrderPage.selectOrderType('dine-in');
      cy.get('[data-cy="table-selection"]').should('exist');
    });

    it('should hide address field for pickup orders', () => {
      OrderPage.selectOrderType('delivery');
      OrderPage.getAddressInput().should('be.visible');
      OrderPage.selectOrderType('pickup');
      OrderPage.getAddressInput().should('not.be.visible');
    });
  });

  describe('Checkout Form — Validation', () => {
    beforeEach(() => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      OrderPage.visit();
    });

    it('should show required-field errors when submitting blank form', () => {
      OrderPage.getPlaceOrderButton().click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should show email-format error for invalid email', () => {
      OrderPage.getNameInput().type('John Doe');
      OrderPage.getEmailInput().type('not-an-email').blur();
      cy.contains('email', { matchCase: false }).should('be.visible');
    });

    it('should enable Pay with Stripe button when form is valid', () => {
      OrderPage.enterCustomerDetails('John Doe', 'john@example.com', '07700900123');
      OrderPage.getPlaceOrderButton().should('not.be.disabled');
    });
  });

  describe('Checkout Form — Successful Submission', () => {
    beforeEach(() => {
      MenuPage.visit();
      cy.wait('@getMenu');
      MenuPage.addToCart(0);
      OrderPage.visit();
    });

    it('should redirect to payment-success after dine-in order', () => {
      OrderPage.enterCustomerDetails('John Doe', 'john@example.com', '07700900123');
      OrderPage.getPlaceOrderButton().click();
      cy.wait('@createPayment');
      OrderPage.verifyOrderConfirmation();
    });

    it('should redirect to payment-success after delivery order with address', () => {
      OrderPage.selectOrderType('delivery');
      OrderPage.completeOrder('Sara Ali', 'sara@example.com', '07700900125', '42 Baker Street, London');
      cy.wait('@createPayment');
      OrderPage.verifyOrderConfirmation();
    });
  });

  describe('Cart Calculations', () => {
    beforeEach(() => {
      MenuPage.visit();
      cy.wait('@getMenu');
    });

    it('should display a total with £ symbol when a single item is in the cart', () => {
      MenuPage.addToCart(0);
      OrderPage.visit();
      OrderPage.getOrderTotal().should('contain', '£');
    });

    it('should display a total when multiple items are in the cart', () => {
      MenuPage.addToCart(0);
      MenuPage.addToCart(1);
      OrderPage.visit();
      OrderPage.getOrderTotal().should('contain', '£');
    });

    it('should update the total when item quantity is changed', () => {
      MenuPage.addToCart(0);
      OrderPage.visit();
      OrderPage.getOrderTotal().then(($el) => {
        const initial = $el.text();
        OrderPage.changeQuantity(0, 3);
        OrderPage.getOrderTotal().should(($updated) => {
          expect($updated.text()).not.to.equal(initial);
        });
      });
    });

    it('should update the total when an item is removed', () => {
      MenuPage.addToCart(0);
      MenuPage.addToCart(1);
      OrderPage.visit();
      OrderPage.getOrderTotal().then(($el) => {
        const initial = $el.text();
        OrderPage.removeItem(0);
        OrderPage.getOrderTotal().should(($updated) => {
          expect($updated.text()).not.to.equal(initial);
        });
      });
    });
  });
});
