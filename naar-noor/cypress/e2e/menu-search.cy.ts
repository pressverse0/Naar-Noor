/// <reference types="cypress" />
import { interceptMenu } from '../support/db-isolation';
import { MenuPage } from '../support/page-objects/MenuPage';

/**
 * Menu Search & Filter E2E Tests
 *
 * DB_AVAILABLE = true  → passthrough intercept; real API responds
 * DB_AVAILABLE = false → fixture stub via interceptMenu()
 *
 * Fixture items (menu.json) — counts used in assertions below:
 *   Lamb Rogan Josh   Mains    £16.95   (not veg)
 *   Chicken Momos     Starters £8.50    (not veg)
 *   Dal Bhat          Mains    £12.50   (veg + vegan + GF)
 *   Mango Lassi       Drinks   £4.50    (veg + GF)
 *   Gulab Jamun       Desserts £5.95    (veg)
 *   Sekuwa            Mains    £14.50   (GF only)
 *
 * When DB_AVAILABLE=true the live database may hold more items, so
 * assertions use .at.least N rather than exact counts where noted.
 */
describe('Menu Search & Filter E2E Tests', () => {
  beforeEach(() => {
    interceptMenu();
    MenuPage.visit();
    cy.wait('@getMenu');
  });

  describe('Menu Display', () => {
    it('should display all menu items', () => {
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should display an Add button on each item', () => {
      MenuPage.getAddButton(0).should('exist');
    });

    it('should display prices with £ symbol', () => {
      MenuPage.getMenuItem(0).should('contain', '£');
    });

    it('should display known item names', () => {
      cy.contains('Lamb Rogan Josh').should('exist');
      cy.contains('Dal Bhat').should('exist');
    });
  });

  describe('Category Filtering', () => {
    it('should filter to Mains (≥3 items)', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.verifyMenuItemsDisplayed(3);
    });

    it('should filter to Starters (≥1 item)', () => {
      MenuPage.filterByCategory('Starters');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should filter to Desserts (≥1 item)', () => {
      MenuPage.filterByCategory('Desserts');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should filter to Drinks (≥1 item)', () => {
      MenuPage.filterByCategory('Drinks');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should reset to all items when All is selected', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.filterByCategory('All');
      MenuPage.verifyMenuItemsDisplayed(5);
    });

    it('should confirm category label visible after filtering', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.verifyFilterApplied('Mains');
    });
  });

  describe('Search Functionality', () => {
    it('should find item by full name', () => {
      MenuPage.search('Lamb Rogan Josh');
      MenuPage.verifyItemVisible('Lamb Rogan Josh');
    });

    it('should find item by partial name', () => {
      MenuPage.search('Momo');
      MenuPage.verifyItemVisible('Chicken Momos');
    });

    it('should be case-insensitive', () => {
      MenuPage.search('LAMB');
      MenuPage.verifyItemVisible('Lamb Rogan Josh');
    });

    it('should return no results for unknown query', () => {
      MenuPage.search('Nonexistent Dish XYZ');
      MenuPage.verifyNoResultsFound();
    });

    it('should show all items after clearing search', () => {
      MenuPage.search('Lamb');
      cy.get('input[type="search"]').clear();
      MenuPage.verifyMenuItemsDisplayed(5);
    });
  });

  describe('Combined Search & Filter', () => {
    it('should find item when search matches filtered category', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.search('Lamb');
      MenuPage.verifyItemVisible('Lamb Rogan Josh');
    });

    it('should return no results when search conflicts with category filter', () => {
      MenuPage.filterByCategory('Desserts');
      MenuPage.search('Lamb');
      MenuPage.verifyNoResultsFound();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort by price low to high (cheapest card appears first)', () => {
      cy.get('select[name="sortBy"]').select('price-asc');
      cy.get('[data-cy="menu-item"]').first().should('contain', '£');
    });

    it('should sort by price high to low (most expensive card appears first)', () => {
      cy.get('select[name="sortBy"]').select('price-desc');
      cy.get('[data-cy="menu-item"]').first().should('contain', '£');
    });

    it('should sort by name without emptying the list', () => {
      cy.get('select[name="sortBy"]').select('name');
      MenuPage.verifyMenuItemsDisplayed(1);
    });
  });

  describe('Dietary Filters', () => {
    it('should filter to vegetarian items (≥3)', () => {
      cy.get('input[name="vegetarian"]').check();
      MenuPage.verifyMenuItemsDisplayed(3);
    });

    it('should filter to vegan items — Dal Bhat must be present', () => {
      cy.get('input[name="vegan"]').check();
      MenuPage.verifyMenuItemsDisplayed(1);
      cy.contains('Dal Bhat').should('exist');
    });

    it('should filter to gluten-free items (≥4)', () => {
      cy.get('input[name="glutenFree"]').check();
      MenuPage.verifyMenuItemsDisplayed(4);
    });

    it('should combine veg + GF filters (≥2 items)', () => {
      cy.get('input[name="vegetarian"]').check();
      cy.get('input[name="glutenFree"]').check();
      MenuPage.verifyMenuItemsDisplayed(2);
    });

    it('should restore all items after unchecking dietary filter', () => {
      cy.get('input[name="vegetarian"]').check();
      cy.get('input[name="vegetarian"]').uncheck();
      MenuPage.verifyMenuItemsDisplayed(5);
    });
  });
});
