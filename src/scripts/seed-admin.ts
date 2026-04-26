import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function seedAdmin() {
  const adminEmail = "vrishtidhage@gmail.com";
  const adminPassword = "Vrishti@21";
  const adminRole = "ADMIN";

  try {
    // Check if the admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin);
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        passwordHash,
        workspaceRole: adminRole,
      },
    });

    console.log("Admin user created successfully:", newAdmin);
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();