import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

dotenv.config();

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || "Scholastica Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed an admin");
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    studentId: `ADMIN-${Date.now()}`,
    passwordHash,
    role: "admin",
    isVerifiedStudent: true,
    status: "active"
  });

  console.log(`Admin created for ${email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
