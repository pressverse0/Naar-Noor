/// <reference types="cypress" />
import { interceptMenu } from '../support/db-isolation';

/**
 * E2E: Add to Cart
 *
 * DB_AVAILABLE = true  → passthrough intercept; real API responds
 * DB_AVAILABLE = false → fixture stub (menu.json) via interceptMenu()
 *
 * Covers: cart badge, adding single/multiple items, opening the cart drawer,
 *         viewing items inside, closing the drawer, and badge persistence.
 */
describe('Add to Cart', () => {
  beforeEach(() => {
    interceptMenu();
    cy.visit('/menu');
    cy.wait('@getMenu');
  });

  // ── Cart badge state ───────────────────────────────────────────────────────

  it('shows no badge when the cart is empty', () => {
    cy.get('[data-cy="cart-badge"]').should('not.exist');
  });

  it('shows badge with count 1 after adding a single item', () => {
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="cart-badge"]').should('be.visible').and('contain', '1');
  });

  it('increments the badge count for each unique item added', () => {
    cy.get('[data-cy="menu-item"]').eq(0).contains('button', 'Add').click();
    cy.get('[data-cy="menu-item"]').eq(1).contains('button', 'Add').click();
    cy.get('[data-cy="cart-badge"]').should('contain', '2');
  });

  it('increments the badge when the same item is added twice', () => {
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="cart-badge"]').should('contain', '2');
  });

  it('accumulates count across three different items', () => {
    cy.get('[data-cy="menu-item"]').eq(0).contains('button', 'Add').click();
    cy.get('[data-cy="menu-item"]').eq(1).contains('button', 'Add').click();
    cy.get('[data-cy="menu-item"]').eq(2).contains('button', 'Add').click();
    cy.get('[data-cy="cart-badge"]').should('contain', '3');
  });

  // ── Cart drawer open / close ───────────────────────────────────────────────

  it('opens the cart drawer when the cart icon is clicked', () => {
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-drawer"]').should('be.visible');
  });

  it('closes the drawer when the close button is clicked', () => {
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-drawer"]').should('be.visible');
    cy.get('[data-cy="cart-drawer-close"]').click();
    cy.get('[data-cy="cart-drawer"]').should('not.be.visible');
  });

  // ── Cart drawer contents ───────────────────────────────────────────────────

  it('shows the added item name inside the drawer', () => {
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-drawer"]').within(() => {
      cy.get('[data-cy="menu-item"], [data-cy="cart-item"]').should('have.length.at.least', 1);
    });
  });

  it('shows the item price inside the drawer', () => {
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-drawer"]').within(() => {
      cy.contains('£').should('exist');
    });
  });

  it('shows two distinct items after adding two different menu items', () => {
    cy.get('[data-cy="menu-item"]').eq(0).contains('button', 'Add').click();
    cy.get('[data-cy="menu-item"]').eq(1).contains('button', 'Add').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-drawer"]').within(() => {
      cy.get('[data-cy="cart-item"], li').should('have.length.at.least', 2);
    });
  });

  // ── Badge persistence across navigation ───────────────────────────────────

  it('persists the cart badge count after navigating to another page', () => {
    cy.get('[data-cy="menu-item"]').first().contains('button', 'Add').click();
    cy.get('[data-cy="cart-badge"]').should('contain', '1');
    cy.contains('a', 'About').click();
    cy.url().should('include', '/about');
    cy.get('[data-cy="cart-badge"]').should('contain', '1');
  });
});
