import prisma from "./config/database.js";

async function testDatabase() {
  try {
    await prisma.$connect();

    const screens = await prisma.screen.findMany();

    console.log("Connected to Neon PostgreSQL!");
    console.log("Screens:", screens);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();