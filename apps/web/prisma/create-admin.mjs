import "dotenv/config";
import { hash } from "bcryptjs";
import pg from "pg";

const { Client } = pg;

const SALT_ROUNDS = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL || "sibagun@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Lore@2026";
  const name = process.env.ADMIN_NAME || "Admin";

  console.log(`Creating admin user: ${email}`);

  // Hash password
  const passwordHash = await hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Connect directly with pg
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    // Check if user exists
    const existingResult = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingResult.rows.length > 0) {
      console.log(`User ${email} already exists`);
      // Update to admin
      await client.query(
        "UPDATE users SET role = 'ADMIN' WHERE LOWER(email) = LOWER($1)",
        [email]
      );
      console.log("Updated to ADMIN role");
    } else {
      // Insert new user
      await client.query(
        `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'ADMIN', true, $5, $5)`,
        [id, email.toLowerCase(), passwordHash, name, now]
      );
      console.log(`Admin user created successfully!`);
      console.log(`  Email: ${email}`);
      console.log(`  Name: ${name}`);
    }
  } finally {
    await client.end();
  }
}

main().catch(console.error);
