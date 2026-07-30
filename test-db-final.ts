import "dotenv/config";
import { db } from "./lib/db";

async function main() {
  console.log("Connecting to database...");
  try {
    const projects = await db.project.findMany({ take: 1 });
    console.log("Success! Found projects:", projects.length);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
