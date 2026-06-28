/**
 * MenuPage Page Object
 * Encapsulates UI interactions for menu browsing and filtering
 */

export class MenuPage {
  /**
   * Navigate to menu page
   */
  static visit() {
    cy.visit('/menu');
  }

  /**
   * Get menu items list
   */
  static getMenuItems() {
    return cy.get('[data-cy="menu-item"]');
  }

  /**
   * Get specific menu item by index
   */
  static getMenuItem(index: number) {
    return cy.get('[data-cy="menu-item"]').eq(index);
  }

  /**
   * Get category filter
   */
  static getCategoryFilter() {
    return cy.get('[data-cy="category-filter"]');
  }

  /**
   * Get search input
   */
  static getSearchInput() {
    return cy.get('input[type="search"]');
  }

  /**
   * Get add to cart button
   */
  static getAddButton(itemIndex: number) {
    return cy.get('[data-cy="menu-item"]').eq(itemIndex).find('button').contains('Add');
  }

  /**
   * Filter by category
   */
  static filterByCategory(category: string) {
    this.getCategoryFilter().select(category);
  }

  /**
   * Search menu items
   */
  static search(query: string) {
    this.getSearchInput().type(query);
  }

  /**
   * Add item to cart
   */
  static addToCart(itemIndex: number) {
    this.getAddButton(itemIndex).click();
  }

  /**
   * Verify menu items displayed
   */
  static verifyMenuItemsDisplayed(count: number) {
    this.getMenuItems().should('have.length.at.least', count);
  }

  /**
   * Verify specific item visible
   */
  static verifyItemVisible(itemName: string) {
    cy.contains('[data-cy="menu-item"]', itemName).should('be.visible');
  }

  /**
   * Verify item price
   */
  static verifyItemPrice(itemIndex: number, price: string) {
    this.getMenuItem(itemIndex).should('contain', price);
  }

  /**
   * Verify empty results
   */
  static verifyNoResultsFound() {
    cy.contains('No items found').should('be.visible');
  }

  /**
   * Get item detail
   */
  static clickItemDetail(itemIndex: number) {
    this.getMenuItem(itemIndex).click();
  }

  /**
   * Verify item filtered
   */
  static verifyFilterApplied(category: string) {
    cy.contains(category).should('be.visible');
  }
}
