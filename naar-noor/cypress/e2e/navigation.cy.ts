/// <reference types="cypress" />
import { interceptMenu } from '../support/db-isolation';

/**
 * Navigation E2E Tests
 *
 * DB_AVAILABLE = true  → real menu API (passthrough intercept)
 * DB_AVAILABLE = false → fixture stub (menu.json)
 */
describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    interceptMenu();
    cy.visit('/');
  });

  describe('Main Navigation', () => {
    it('should display header', () => {
      cy.get('[data-cy="header"]').should('exist');
    });

    it('should display logo', () => {
      cy.get('[data-cy="logo"]').should('exist');
    });

    it('should display navigation menu', () => {
      cy.get('[data-cy="nav-menu"]').should('exist');
    });

    it('should have home link', () => {
      cy.contains('Home').should('exist');
    });

    it('should have menu link', () => {
      cy.contains('Menu').should('exist');
    });

    it('should have reservations link', () => {
      cy.contains('Reservations').should('exist');
    });

    it('should have about link', () => {
      cy.contains('About').should('exist');
    });

    it('should have contact link', () => {
      cy.contains('Contact').should('exist');
    });
  });

  describe('Header Links Navigation', () => {
    it('should navigate to home', () => {
      cy.contains('Menu').click();
      cy.url().should('include', '/menu');
      cy.contains('Home').click();
      cy.url().should('not.include', '/menu');
    });

    it('should navigate to menu', () => {
      cy.contains('Menu').click();
      cy.url().should('include', '/menu');
    });

    it('should navigate to reservations', () => {
      cy.contains('Reservations').click();
      cy.url().should('include', '/reservations');
    });

    it('should navigate to about', () => {
      cy.contains('About').click();
      cy.url().should('include', '/about');
    });

    it('should navigate to contact', () => {
      cy.contains('Contact').click();
      cy.url().should('include', '/contact');
    });
  });

  describe('Cart Access', () => {
    it('should display cart icon', () => {
      cy.get('[data-cy="cart-icon"]').should('exist');
    });

    it('hides cart badge when cart is empty, shows it after adding an item', () => {
      cy.get('[data-cy="cart-badge"]').should('not.exist');

      cy.visit('/menu');
      cy.wait('@getMenu');
      cy.get('[data-cy="menu-item"]').first().find('button').contains('Add').click();

      cy.get('[data-cy="cart-badge"]').should('exist').and('contain', '1');
    });

    it('should open cart drawer', () => {
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="cart-drawer"]').should('be.visible');
    });

    it('should close cart drawer', () => {
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="cart-drawer-close"]').click();
      cy.get('[data-cy="cart-drawer"]').should('not.be.visible');
    });
  });

  describe('Footer Navigation', () => {
    it('should display footer', () => {
      cy.get('[data-cy="footer"]').should('exist');
    });

    it('should have quick links', () => {
      cy.get('[data-cy="footer-quick-links"]').should('exist');
    });

    it('should have contact information', () => {
      cy.get('[data-cy="footer-contact"]').should('exist');
    });

    it('should have social media links', () => {
      cy.get('[data-cy="footer-social"]').should('exist');
    });

    it('should have copyright', () => {
      cy.get('[data-cy="footer-copyright"]').should('contain', '©');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should display breadcrumb on menu', () => {
      cy.visit('/menu');
      cy.wait('@getMenu');
      cy.get('[data-cy="breadcrumb"]').should('exist');
    });

    it('should navigate via breadcrumb', () => {
      cy.visit('/menu');
      cy.wait('@getMenu');
      cy.get('[data-cy="breadcrumb"]').contains('Home').click();
      cy.url().should('not.include', '/menu');
    });
  });

  describe('Page Titles', () => {
    it('should have correct title on home', () => {
      cy.title().should('contain', 'Naar & Noor');
    });

    it('should have correct title on menu', () => {
      cy.visit('/menu');
      cy.title().should('contain', 'Menu');
    });

    it('should have correct title on reservations', () => {
      cy.visit('/reservations');
      cy.title().should('contain', 'Reservations');
    });

    it('should have correct title on about', () => {
      cy.visit('/about');
      cy.title().should('contain', 'About');
    });

    it('should have correct title on contact', () => {
      cy.visit('/contact');
      cy.title().should('contain', 'Contact');
    });
  });

  describe('URL Parameters', () => {
    it('should preserve category filter in URL', () => {
      cy.visit('/menu?category=Mains');
      cy.url().should('include', 'category=Mains');
    });

    it('should preserve search in URL', () => {
      cy.visit('/menu?search=Lamb');
      cy.url().should('include', 'search=Lamb');
    });

    it('should handle multiple parameters', () => {
      cy.visit('/menu?category=Mains&sort=price');
      cy.url().should('include', 'category=Mains');
      cy.url().should('include', 'sort=price');
    });
  });

  describe('Back Navigation', () => {
    it('should navigate back', () => {
      cy.visit('/menu');
      cy.wait('@getMenu');
      cy.visit('/about');
      cy.go('back');
      cy.url().should('include', '/menu');
    });

    it('should maintain query params on back', () => {
      cy.visit('/menu?category=Mains');
      cy.wait('@getMenu');
      cy.visit('/about');
      cy.go('back');
      cy.url().should('include', 'category=Mains');
    });
  });

  describe('404 Handling', () => {
    it('should display 404 page for invalid route', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.contains('Page not found').should('be.visible');
    });

    it('should have link to home from 404', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.contains('Home').click();
      cy.url().should('not.include', '/nonexistent');
    });
  });
});
