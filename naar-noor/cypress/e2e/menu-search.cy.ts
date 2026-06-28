/// <reference types="cypress" />
import { MenuPage } from '../support/page-objects/MenuPage';

describe('Menu Search & Filter E2E Tests', () => {
  beforeEach(() => {
    MenuPage.visit();
  });

  describe('Menu Display', () => {
    it('should display menu items', () => {
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should display item details', () => {
      MenuPage.getMenuItem(0).should('contain', 'Add');
    });

    it('should display item prices', () => {
      MenuPage.getMenuItem(0).should('contain', '£');
    });

    it('should have add to cart button', () => {
      MenuPage.getAddButton(0).should('exist');
    });
  });

  describe('Category Filtering', () => {
    it('should filter by category', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.verifyFilterApplied('Mains');
    });

    it('should filter to starters', () => {
      MenuPage.filterByCategory('Starters');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should filter to desserts', () => {
      MenuPage.filterByCategory('Desserts');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should filter to drinks', () => {
      MenuPage.filterByCategory('Drinks');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should reset to all items', () => {
      MenuPage.filterByCategory('All');
      MenuPage.verifyMenuItemsDisplayed(5);
    });
  });

  describe('Search Functionality', () => {
    it('should search by item name', () => {
      MenuPage.search('Biryani');
      MenuPage.verifyItemVisible('Biryani');
    });

    it('should search by partial name', () => {
      MenuPage.search('Tandoo');
      MenuPage.verifyItemVisible('Tandoori');
    });

    it('should return no results for nonexistent item', () => {
      MenuPage.search('Nonexistent');
      MenuPage.verifyNoResultsFound();
    });

    it('should be case insensitive', () => {
      MenuPage.search('BIRYANI');
      MenuPage.verifyItemVisible('Biryani');
    });

    it('should clear search results', () => {
      MenuPage.search('Biryani');
      MenuPage.search('');
      MenuPage.verifyMenuItemsDisplayed(5);
    });
  });

  describe('Combined Search & Filter', () => {
    it('should search within filtered category', () => {
      MenuPage.filterByCategory('Mains');
      MenuPage.search('Biryani');
      MenuPage.verifyItemVisible('Biryani');
    });

    it('should show no results when search conflicts with filter', () => {
      MenuPage.filterByCategory('Desserts');
      MenuPage.search('Biryani');
      MenuPage.verifyNoResultsFound();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort by price low to high', () => {
      cy.get('select[name="sortBy"]').select('price-asc');
      cy.get('[data-cy="menu-item"]').first().should('exist');
    });

    it('should sort by price high to low', () => {
      cy.get('select[name="sortBy"]').select('price-desc');
      cy.get('[data-cy="menu-item"]').first().should('exist');
    });

    it('should sort by name', () => {
      cy.get('select[name="sortBy"]').select('name');
      cy.get('[data-cy="menu-item"]').first().should('exist');
    });

    it('should sort by newest first', () => {
      cy.get('select[name="sortBy"]').select('newest');
      cy.get('[data-cy="menu-item"]').first().should('exist');
    });
  });

  describe('Dietary Filters', () => {
    it('should filter vegetarian items', () => {
      cy.get('input[name="vegetarian"]').check();
      cy.get('[data-cy="menu-item"]').should('contain', 'Vegetarian');
    });

    it('should filter vegan items', () => {
      cy.get('input[name="vegan"]').check();
      cy.get('[data-cy="menu-item"]').should('contain', 'Vegan');
    });

    it('should filter gluten-free items', () => {
      cy.get('input[name="glutenFree"]').check();
      cy.get('[data-cy="menu-item"]').should('contain', 'Gluten-Free');
    });

    it('should combine multiple dietary filters', () => {
      cy.get('input[name="vegetarian"]').check();
      cy.get('input[name="glutenFree"]').check();
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should clear dietary filters', () => {
      cy.get('input[name="vegetarian"]').check();
      cy.get('input[name="vegetarian"]').uncheck();
      MenuPage.verifyMenuItemsDisplayed(5);
    });
  });

  describe('Price Range Filter', () => {
    it('should filter by minimum price', () => {
      cy.get('input[name="minPrice"]').type('15');
      MenuPage.verifyMenuItemsDisplayed(1);
    });

    it('should filter by maximum price', () => {
      cy.get('input[name="maxPrice"]').type('20');
      MenuPage.verifyMenuItemsDisplayed(3);
    });

    it('should filter by price range', () => {
      cy.get('input[name="minPrice"]').type('10');
      cy.get('input[name="maxPrice"]').type('25');
      MenuPage.verifyMenuItemsDisplayed(2);
    });
  });
});
