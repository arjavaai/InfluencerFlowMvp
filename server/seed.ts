import { storage } from "./storage";

async function seedDatabase() {
  try {
    await storage.seedData();
    console.log("Demo accounts created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating demo accounts:", error);
    process.exit(1);
  }
}

seedDatabase();