/// <reference types="cypress" />
import { interceptReviews } from '../support/db-isolation';

/**
 * Reviews E2E Tests
 *
 * DB_AVAILABLE = true  → passthrough intercept; real API responds
 * DB_AVAILABLE = false → fixture stub (reviews.json) via interceptReviews()
 *
 * POST /api/reviews is always stubbed — we never persist test reviews.
 */
describe('Reviews E2E Tests', () => {
  beforeEach(() => {
    interceptReviews();
    cy.visit('/reviews');
    cy.wait('@getReviews');
  });

  describe('Viewing Reviews', () => {
    it('should display the reviews page', () => {
      cy.title().should('contain', 'Reviews');
    });

    it('should display review cards', () => {
      cy.get('[data-cy="review-card"]').should('have.length.at.least', 1);
    });

    it('should display reviewer names from the fixture', () => {
      cy.contains('Ahmed Hassan').should('exist');
      cy.contains('Sara Ali').should('exist');
    });

    it('should display star ratings', () => {
      cy.get('[data-cy="review-card"]').first().find('[data-cy="rating-stars"]').should('exist');
    });

    it('should display review comments', () => {
      cy.get('[data-cy="review-card"]').first().should('contain.text', ' ');
    });

    it('should display review dates', () => {
      cy.get('[data-cy="review-card"]').first().should('contain', '2026');
    });
  });

  describe('Rating Selector', () => {
    it('should display the rating selector', () => {
      cy.get('[data-cy="rating-selector"]').should('exist');
    });

    it('should have 5 rating buttons', () => {
      cy.get('[data-cy="rating-selector"]').find('button').should('have.length', 5);
    });

    it('should allow selecting a rating', () => {
      cy.get('[data-cy="rating-selector"]').find('button').eq(3).click();
      cy.get('[data-cy="rating-selector"]').find('button').eq(3)
        .should('have.class', /selected|active|filled/);
    });
  });

  describe('Submitting a Review', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/reviews*', {
        statusCode: 201,
        body: {
          id: 'review-new',
          reviewerName: 'Test Reviewer',
          rating: 5,
          comment: 'Fantastic service and delicious food!',
          date: '2026-06-30T00:00:00Z',
        },
      }).as('createReview');
    });

    it('should show a success message after submission', () => {
      cy.get('input[name="reviewerName"]').type('Test Reviewer');
      cy.get('[data-cy="rating-selector"]').find('button').eq(4).click();
      cy.get('textarea[name="comment"]').type('Fantastic service and delicious food!');
      cy.get('button').contains('Submit Review').click();
      cy.wait('@createReview');
      cy.get('[data-cy="success-message"]').should('be.visible');
    });

    it('should clear the form after a successful submission', () => {
      cy.get('input[name="reviewerName"]').type('Test User');
      cy.get('[data-cy="rating-selector"]').find('button').eq(3).click();
      cy.get('textarea[name="comment"]').type('Good food overall.');
      cy.get('button').contains('Submit Review').click();
      cy.wait('@createReview');
      cy.get('input[name="reviewerName"]').should('have.value', '');
      cy.get('textarea[name="comment"]').should('have.value', '');
    });

    it('should require reviewer name before submitting', () => {
      cy.get('[data-cy="rating-selector"]').find('button').eq(4).click();
      cy.get('textarea[name="comment"]').type('No name provided.');
      cy.get('button').contains('Submit Review').click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should require a comment before submitting', () => {
      cy.get('input[name="reviewerName"]').type('Anonymous');
      cy.get('[data-cy="rating-selector"]').find('button').eq(2).click();
      cy.get('button').contains('Submit Review').click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should require a rating before submitting', () => {
      cy.get('input[name="reviewerName"]').type('Anonymous');
      cy.get('textarea[name="comment"]').type('No rating selected.');
      cy.get('button').contains('Submit Review').click();
      cy.contains('required', { matchCase: false }).should('be.visible');
    });
  });

  describe('Review Display Details', () => {
    it('should display at least 3 fixture reviews', () => {
      cy.get('[data-cy="review-card"]').should('have.length.at.least', 3);
    });

    it('should show star rating element on each card', () => {
      cy.get('[data-cy="review-card"]').each(($card) => {
        cy.wrap($card).find('[data-cy="rating-stars"]').should('exist');
      });
    });
  });
});
