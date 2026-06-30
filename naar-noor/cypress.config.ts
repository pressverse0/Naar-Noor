import { defineConfig } from 'cypress';
import { Client } from 'pg';

const DB_URL = process.env['DATABASE_URL'] ?? '';

async function withDb<T>(
  fn: (client: Client) => Promise<T>
): Promise<T | { skipped: boolean; reason: string }> {
  if (!DB_URL) return { skipped: true, reason: 'DATABASE_URL not configured — set it in Replit Secrets to enable live DB seeding' };
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    setupNodeEvents(on) {
      on('task', {
        async 'db:seed:menu'(items: Record<string, unknown>[]) {
          return withDb(async (client) => {
            for (const item of items) {
              await client.query(
                `INSERT INTO "MenuItems"
                   ("Id","Name","Description","Price","Category",
                    "IsVegetarian","IsVegan","IsGlutenFree","IsAvailable","ImageUrl","SortOrder")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                 ON CONFLICT ("Id") DO UPDATE SET
                   "Name"=EXCLUDED."Name","Description"=EXCLUDED."Description",
                   "Price"=EXCLUDED."Price","Category"=EXCLUDED."Category",
                   "IsVegetarian"=EXCLUDED."IsVegetarian","IsVegan"=EXCLUDED."IsVegan",
                   "IsGlutenFree"=EXCLUDED."IsGlutenFree"`,
                [
                  item['id'], item['name'], item['description'], item['price'],
                  item['category'], item['isVegetarian'] ?? false,
                  item['isVegan'] ?? false, item['isGlutenFree'] ?? false,
                  item['isAvailable'] ?? true, item['imageUrl'] ?? '',
                  item['sortOrder'] ?? 0,
                ]
              );
            }
            return { success: true, seeded: items.length };
          });
        },

        async 'db:seed:chefs'(chefs: Record<string, unknown>[]) {
          return withDb(async (client) => {
            for (const chef of chefs) {
              await client.query(
                `INSERT INTO "Chefs"
                   ("Id","Name","Title","Specialty","Bio","IsAvailable")
                 VALUES ($1,$2,$3,$4,$5,$6)
                 ON CONFLICT ("Id") DO UPDATE SET
                   "Name"=EXCLUDED."Name","Title"=EXCLUDED."Title",
                   "Specialty"=EXCLUDED."Specialty","IsAvailable"=EXCLUDED."IsAvailable"`,
                [
                  chef['id'], chef['name'], chef['title'],
                  chef['specialty'], chef['bio'] ?? '',
                  chef['isAvailable'] ?? true,
                ]
              );
            }
            return { success: true, seeded: chefs.length };
          });
        },

        async 'db:clean:reservations'(testEmail: string) {
          return withDb(async (client) => {
            const res = await client.query(
              `DELETE FROM "Reservations" WHERE "Email" = $1`,
              [testEmail]
            );
            return { success: true, deleted: res.rowCount ?? 0 };
          });
        },

        async 'db:clean:orders'(testEmail: string) {
          return withDb(async (client) => {
            const res = await client.query(
              `DELETE FROM "Orders" WHERE "Email" = $1`,
              [testEmail]
            );
            return { success: true, deleted: res.rowCount ?? 0 };
          });
        },

        async 'db:clean:user'(email: string) {
          return withDb(async (client) => {
            const res = await client.query(
              `DELETE FROM "Users" WHERE "Email" = $1`,
              [email]
            );
            return { success: true, deleted: res.rowCount ?? 0 };
          });
        },

        async 'db:count'({ table, where }: { table: string; where?: string }) {
          return withDb(async (client) => {
            const q =
              `SELECT COUNT(*) AS n FROM "${table}"` +
              (where ? ` WHERE ${where}` : '');
            const res = await client.query(q);
            return { count: parseInt(res.rows[0].n as string, 10) };
          });
        },

        /**
         * Safely check whether a menu item with the given name is in the DB.
         * Uses a parameterised query — no SQL-injection risk.
         * Returns { found: boolean, count: number } or { skipped: true }.
         */
        async 'db:find:menuItem'(name: string) {
          return withDb(async (client) => {
            const res = await client.query(
              `SELECT COUNT(*) AS n FROM "MenuItems" WHERE "Name" = $1`,
              [name]
            );
            const count = parseInt(res.rows[0].n as string, 10);
            return { found: count > 0, count };
          });
        },
      });
    },
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.ts',
  },
});
