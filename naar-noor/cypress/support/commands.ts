// ──────────────────────────────────────────────────────────────────────────────
// Custom Cypress commands for Naar & Noor E2E tests
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake JWT that auth.service.ts can decode.
 * The service base64-decodes the payload segment — it never verifies the signature.
 */
function makeFakeJwt(email: string, userId = 'test-user-id'): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: userId, email, iat: Math.floor(Date.now() / 1000) }));
  return `${header}.${payload}.fake-e2e-signature`;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Visit a URL with a pre-seeded auth session (nn_session in localStorage).
       * Session is injected via onBeforeLoad so Angular reads it during boot.
       */
      visitAuthenticated(url: string, email?: string): Chainable<void>;

      /**
       * Seed menu items from fixtures/menu.json into the live DB via cy.task().
       * No-op (with a log) when DATABASE_URL is not configured.
       */
      seedMenu(): Chainable<void>;

      /**
       * Seed chefs from fixtures/chefs.json into the live DB via cy.task().
       * No-op (with a log) when DATABASE_URL is not configured.
       */
      seedChefs(): Chainable<void>;

      /**
       * Delete reservations and orders created during E2E tests for the given
       * email address.  No-op when DATABASE_URL is not configured.
       */
      cleanupAfterTest(email?: string): Chainable<void>;

      /**
       * Assert that a menu item with the given name exists in the live database.
       *
       * Uses a parameterised SQL query against the MenuItems table so there is
       * zero SQL-injection risk.  Silently skips (with a cy.log) when
       * DATABASE_URL is not configured or when running in stub mode.
       *
       * Example:
       *   cy.assertMenuItemSeeded('Lamb Rogan Josh');
       *   cy.assertMenuItemSeeded('Dal Bhat');
       */
      assertMenuItemSeeded(name: string): Chainable<void>;
    }
  }
}

// ── visitAuthenticated ────────────────────────────────────────────────────────

Cypress.Commands.add('visitAuthenticated', (url: string, email = 'demo@example.com') => {
  const session = {
    accessToken: makeFakeJwt(email),
    userId: 'test-user-id',
    email,
  };
  cy.visit(url, {
    onBeforeLoad(win) {
      // Set BEFORE Angular initialises — auth.service.ts's loadSession() reads
      // 'nn_session' from localStorage on app startup.
      win.localStorage.setItem('nn_session', JSON.stringify(session));
    },
  });
});

// ── seedMenu / seedChefs ──────────────────────────────────────────────────────

Cypress.Commands.add('seedMenu', () => {
  cy.fixture('menu.json').then((items) => {
    cy.task('db:seed:menu', items, { log: false }).then((result) => {
      const r = result as { skipped?: boolean; seeded?: number };
      if (r.skipped) {
        cy.log('db:seed:menu skipped — DATABASE_URL not set');
      } else {
        cy.log(`db:seed:menu: seeded ${r.seeded} items`);
      }
    });
  });
});

Cypress.Commands.add('seedChefs', () => {
  cy.fixture('chefs.json').then((chefs) => {
    cy.task('db:seed:chefs', chefs, { log: false }).then((result) => {
      const r = result as { skipped?: boolean; seeded?: number };
      if (r.skipped) {
        cy.log('db:seed:chefs skipped — DATABASE_URL not set');
      } else {
        cy.log(`db:seed:chefs: seeded ${r.seeded} chefs`);
      }
    });
  });
});

// ── cleanupAfterTest ──────────────────────────────────────────────────────────

Cypress.Commands.add('cleanupAfterTest', (email = 'test@example.com') => {
  cy.task('db:clean:reservations', email, { log: false });
  cy.task('db:clean:orders',       email, { log: false });
});

// ── assertMenuItemSeeded ──────────────────────────────────────────────────────

Cypress.Commands.add('assertMenuItemSeeded', (name: string) => {
  // Skip entirely when running in stub mode — no DB is available to query.
  if (!Cypress.env('DB_AVAILABLE')) {
    cy.log(`assertMenuItemSeeded("${name}") — skipped (stub mode, DATABASE_URL not set)`);
    return;
  }

  cy.task('db:find:menuItem', name, { log: false }).then((result) => {
    const r = result as { skipped?: boolean; found?: boolean; count?: number };

    if (r.skipped) {
      // Task itself signalled it couldn't connect — treat as a soft skip.
      cy.log(`assertMenuItemSeeded("${name}") — skipped (task: no DB connection)`);
    } else {
      // Hard assertion: the row must exist.
      expect(r.found, `MenuItems should contain a row with Name = "${name}"`).to.be.true;
    }
  });
});

export {};
