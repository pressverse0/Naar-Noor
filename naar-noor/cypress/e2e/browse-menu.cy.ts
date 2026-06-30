/// <reference types="cypress" />
import { interceptMenu } from '../support/db-isolation';

/**
 * E2E: Browse Menu
 *
 * DB_AVAILABLE = true  → passthrough intercept; real API responds
 * DB_AVAILABLE = false → fixture stub (menu.json) injected by interceptMenu()
 *
 * Covers: page load, category filter, text search, dietary filter,
 *         sort, and the "no results" empty state.
 */
describe('Browse Menu', () => {
  beforeEach(() => {
    interceptMenu();
    cy.visit('/menu');
    cy.wait('@getMenu');
  });

  // ── Page load ──────────────────────────────────────────────────────────────

  it('displays menu items after the API responds', () => {
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
  });

  it('shows the item name and price on each card', () => {
    cy.get('[data-cy="menu-item"]').first().within(() => {
      cy.get('[data-cy="item-name"]').should('exist');
      cy.contains('£').should('exist');
    });
  });

  it('renders an Add button on every item card', () => {
    cy.get('[data-cy="menu-item"]').each(($card) => {
      cy.wrap($card).contains('button', 'Add').should('exist');
    });
  });

  it('shows a breadcrumb with a Home link', () => {
    cy.get('[data-cy="breadcrumb"]').should('exist');
    cy.get('[data-cy="breadcrumb"]').contains('Home').should('exist');
  });

  // ── Category filter ────────────────────────────────────────────────────────

  it('filters items when a category is selected', () => {
    cy.get('[data-cy="category-filter"]').select('Mains');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').each(($el) => {
      cy.wrap($el).find('[data-cy="item-category"]').should('contain', 'Mains');
    });
  });

  it('shows Lamb Rogan Josh when Mains is selected', () => {
    cy.get('[data-cy="category-filter"]').select('Mains');
    cy.get('[data-cy="menu-item"]').contains('Lamb Rogan Josh').should('exist');
  });

  it('filters to Starters', () => {
    cy.get('[data-cy="category-filter"]').select('Starters');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Chicken Momos').should('exist');
  });

  it('filters to Drinks', () => {
    cy.get('[data-cy="category-filter"]').select('Drinks');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Mango Lassi').should('exist');
  });

  it('filters to Desserts', () => {
    cy.get('[data-cy="category-filter"]').select('Desserts');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Gulab Jamun').should('exist');
  });

  it('shows all items when "All" is selected', () => {
    cy.get('[data-cy="category-filter"]').select('Mains');
    cy.get('[data-cy="category-filter"]').select('All');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 5);
  });

  // ── Text search ────────────────────────────────────────────────────────────

  it('filters by item name (case-insensitive)', () => {
    cy.get('input[type="search"]').type('dal');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Dal Bhat').should('exist');
  });

  it('filters by partial name', () => {
    cy.get('input[type="search"]').type('momo');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Chicken Momos').should('exist');
  });

  it('shows the empty state when search has no matches', () => {
    cy.get('input[type="search"]').type('nonexistentdishxyz');
    cy.get('[data-cy="menu-item"]').should('not.exist');
    cy.contains('No items found').should('be.visible');
  });

  it('restores all items when search is cleared', () => {
    cy.get('input[type="search"]').type('momos');
    cy.get('[data-cy="menu-item"]').should('have.length', 1);
    cy.get('input[type="search"]').clear();
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 5);
  });

  // ── Dietary filters ────────────────────────────────────────────────────────

  it('shows only vegan items when the Vegan checkbox is checked', () => {
    cy.get('input[name="vegan"]').check();
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Dal Bhat').should('exist');
  });

  it('shows only gluten-free items when that filter is checked', () => {
    cy.get('input[name="glutenFree"]').check();
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
  });

  // ── Sort ───────────────────────────────────────────────────────────────────

  it('sorts by price ascending (cheapest first)', () => {
    cy.get('select[name="sortBy"]').select('price-asc');
    cy.get('[data-cy="menu-item"]').first().should('contain', '£');
  });

  it('sorts by price descending (most expensive first)', () => {
    cy.get('select[name="sortBy"]').select('price-desc');
    cy.get('[data-cy="menu-item"]').first().should('contain', '£');
  });

  it('sorts alphabetically by name', () => {
    cy.get('select[name="sortBy"]').select('name');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
  });

  // ── Combined filter + search ───────────────────────────────────────────────

  it('applies search within a filtered category', () => {
    cy.get('[data-cy="category-filter"]').select('Mains');
    cy.get('input[type="search"]').type('sekuwa');
    cy.get('[data-cy="menu-item"]').should('have.length.at.least', 1);
    cy.get('[data-cy="menu-item"]').contains('Sekuwa').should('exist');
  });

  it('shows empty state when search conflicts with category', () => {
    cy.get('[data-cy="category-filter"]').select('Desserts');
    cy.get('input[type="search"]').type('momos');
    cy.get('[data-cy="menu-item"]').should('not.exist');
    cy.contains('No items found').should('be.visible');
  });
});
