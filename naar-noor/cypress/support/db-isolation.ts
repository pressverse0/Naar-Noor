/**
 * db-isolation.ts
 *
 * Dual-mode API helper for Naar & Noor E2E tests.
 *
 * MODE A — DATABASE_URL is set in Replit Secrets
 *   seedReferenceData() seeds the live database from fixtures, then verifies
 *   every fixture item is present with cy.assertMenuItemSeeded().
 *   Cypress.env('DB_AVAILABLE') is set to true.
 *   interceptXxx() functions create PASSTHROUGH intercepts — they alias the
 *   request so cy.wait('@alias') still works, but the real API responds.
 *   Tests are fully reproducible against the live backend.
 *
 * MODE B — DATABASE_URL is not set
 *   cy.task() returns { skipped: true }.
 *   Cypress.env('DB_AVAILABLE') is set to false.
 *   interceptXxx() functions inject a fixture body instead.
 *   cy.assertMenuItemSeeded() logs a skip — no assertion is made.
 *
 * ALWAYS STUBBED (never hits real external services):
 *   interceptPayment() — always returns fixture/payment-session.json
 *   interceptAuth()    — always returns fixture/auth-login.json or 401
 */

// Names of every item in cypress/fixtures/menu.json.
// Used after seeding to give DB-level proof that each row was written.
const FIXTURE_MENU_NAMES = [
  'Lamb Rogan Josh',
  'Chicken Momos',
  'Dal Bhat',
  'Mango Lassi',
  'Gulab Jamun',
  'Sekuwa',
] as const;

// ─── Reference data seeding ──────────────────────────────────────────────────

/**
 * Call once in the global before() hook (support/e2e.ts).
 *
 * 1. Seeds menu items and chefs from fixtures into the live DB.
 * 2. Records outcome in Cypress.env('DB_AVAILABLE').
 * 3. When DB is available, runs cy.assertMenuItemSeeded() for every fixture
 *    item — giving DB-level proof that each row was written, on top of the
 *    UI-level assertions in the individual test files.
 */
export function seedReferenceData(): void {
  cy.fixture('menu.json').then((items: unknown[]) => {
    cy.task('db:seed:menu', items, { log: false }).then((result) => {
      const r = result as { skipped?: boolean; seeded?: number };
      Cypress.env('DB_AVAILABLE', !r.skipped);

      if (r.skipped) {
        cy.log('ℹ️  DB seeding skipped — set DATABASE_URL to enable live-API mode');
      } else {
        cy.log(`✅ DB seeded (${r.seeded} menu items) — verifying each row…`);

        // DB-level assertion: every fixture item must now be in the table.
        FIXTURE_MENU_NAMES.forEach((name) => {
          cy.assertMenuItemSeeded(name);
        });
      }
    });
  });

  cy.fixture('chefs.json').then((chefs: unknown[]) => {
    cy.task('db:seed:chefs', chefs, { log: false }).then((result) => {
      const r = result as { skipped?: boolean; seeded?: number };
      if (!r.skipped) cy.log(`✅ DB seeded (${r.seeded} chefs)`);
    });
  });
}

// ─── Conditional intercepts ───────────────────────────────────────────────────

/**
 * Alias `GET /api/menu*`.
 * Passes through to real API when DB is available; uses fixture stub otherwise.
 */
export function interceptMenu(alias = 'getMenu'): void {
  if (Cypress.env('DB_AVAILABLE')) {
    cy.intercept('GET', '/api/menu*').as(alias);
  } else {
    cy.intercept('GET', '/api/menu*', { fixture: 'menu.json' }).as(alias);
  }
}

/**
 * Alias `GET /api/chefs*`.
 * Passes through to real API when DB is available; uses fixture stub otherwise.
 */
export function interceptChefs(alias = 'getChefs'): void {
  if (Cypress.env('DB_AVAILABLE')) {
    cy.intercept('GET', '/api/chefs*').as(alias);
  } else {
    cy.intercept('GET', '/api/chefs*', { fixture: 'chefs.json' }).as(alias);
  }
}

/**
 * Alias `GET /api/reviews*`.
 * Passes through to real API when DB is available; uses fixture stub otherwise.
 */
export function interceptReviews(alias = 'getReviews'): void {
  if (Cypress.env('DB_AVAILABLE')) {
    cy.intercept('GET', '/api/reviews*').as(alias);
  } else {
    cy.intercept('GET', '/api/reviews*', { fixture: 'reviews.json' }).as(alias);
  }
}

/**
 * Alias `POST /api/reservations*`.
 * Passes through to real API when DB is available; stubs 201 otherwise.
 */
export function interceptReservationCreate(alias = 'createReservation'): void {
  if (Cypress.env('DB_AVAILABLE')) {
    cy.intercept('POST', '/api/reservations*').as(alias);
  } else {
    cy.intercept('POST', '/api/reservations*', {
      statusCode: 201,
      fixture: 'reservation.json',
    }).as(alias);
  }
}

/**
 * Always stubs `POST /api/payments/create-checkout-session`.
 * We never hit real Stripe in E2E tests.
 * The fixture returns { url: '/payment-success?session_id=...' } so the
 * Angular component redirects the browser to /payment-success.
 */
export function interceptPayment(alias = 'createPayment'): void {
  cy.intercept('POST', '/api/payments/create-checkout-session*', {
    statusCode: 200,
    fixture: 'payment-session.json',
  }).as(alias);
}

/**
 * Always stubs `POST /api/auth/login`.
 * We never use real credentials in E2E tests.
 */
export function interceptAuth(type: 'success' | 'failure', alias = 'login'): void {
  if (type === 'success') {
    cy.intercept('POST', '/api/auth/login*', {
      statusCode: 200,
      fixture: 'auth-login.json',
    }).as(alias);
  } else {
    cy.intercept('POST', '/api/auth/login*', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as(alias);
  }
}

/**
 * Always stubs `POST /api/auth/logout`.
 */
export function interceptLogout(alias = 'logout'): void {
  cy.intercept('POST', '/api/auth/logout*', {
    statusCode: 200,
    body: {},
  }).as(alias);
}
