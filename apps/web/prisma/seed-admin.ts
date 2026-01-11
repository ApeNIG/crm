import "dotenv/config";
import { hash } from "bcryptjs";

const SALT_ROUNDS = 12;

async function main() {
  // Dynamic import for Prisma 7 compatibility
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    // Get admin credentials from environment variables
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin User";

    if (!email || !password) {
      console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
      console.log("\nUsage:");
      console.log("  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePassword123 npx tsx prisma/seed-admin.ts");
      process.exit(1);
    }

    // Validate password requirements
    if (password.length < 8) {
      console.error("Error: Password must be at least 8 characters long");
      process.exit(1);
    }
    if (!/[A-Z]/.test(password)) {
      console.error("Error: Password must contain at least one uppercase letter");
      process.exit(1);
    }
    if (!/[a-z]/.test(password)) {
      console.error("Error: Password must contain at least one lowercase letter");
      process.exit(1);
    }
    if (!/[0-9]/.test(password)) {
      console.error("Error: Password must contain at least one number");
      process.exit(1);
    }

    console.log(`Creating admin user: ${email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);

      // Update existing user to be admin if not already
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: "ADMIN" },
        });
        console.log("Updated existing user to ADMIN role");
      }

      return;
    }

    // Hash password
    const passwordHash = await hash(password, SALT_ROUNDS);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log(`Admin user created successfully!`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Error seeding admin user:", e);
  process.exit(1);
});
