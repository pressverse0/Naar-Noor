/// <reference types="cypress" />
import './commands';
import { seedReferenceData } from './db-isolation';

/**
 * Global before() — runs once per spec file (each spec gets a fresh browser).
 *
 * Tries to seed menu items and chefs from fixtures into the live database.
 *   • DATABASE_URL set    → seeds DB, sets Cypress.env('DB_AVAILABLE', true)
 *                           → interceptXxx() helpers use passthrough intercepts
 *   • DATABASE_URL absent → tasks return { skipped: true }
 *                           → sets Cypress.env('DB_AVAILABLE', false)
 *                           → interceptXxx() helpers inject fixture stubs
 *
 * Result persists for the lifetime of the spec file, so every beforeEach()
 * that calls interceptMenu() / interceptChefs() etc. reads the correct mode.
 */
before(() => {
  seedReferenceData();
});

/**
 * Global beforeEach() — runs before every single test.
 * Clears localStorage to prevent session bleed-through between tests.
 * Tests that need auth call cy.visitAuthenticated() which injects nn_session
 * via onBeforeLoad — AFTER this clear runs, so the right order is preserved.
 */
beforeEach(() => {
  cy.clearLocalStorage();
});

export {};
