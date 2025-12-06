// prisma.config.ts (or prisma.config.mjs if you prefer JS)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // provide the connection url here
  datasource: {
    url: env("DATABASE_URL"),
  },
});
