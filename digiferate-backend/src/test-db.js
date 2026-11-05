
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.$queryRaw`SELECT 1 AS connected`;

  console.log("Supabase PostgreSQL connected successfully!");
  console.log("Query result:", result);
} catch (error) {
  console.error("Database connection failed:", error);
} finally {
  await prisma.$disconnect();
}
