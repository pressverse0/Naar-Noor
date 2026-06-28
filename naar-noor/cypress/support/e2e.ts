/// <reference types="cypress" />

// Cypress support file
// This runs before each test file

// Suppress TypeScript errors for cy commands
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
    }
  }
}

// Add any global configuration or hooks
beforeEach(() => {
  // Add any setup that should run before each test
});

export {};
