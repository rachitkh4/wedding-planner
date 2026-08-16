import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // The CLI (migrate/studio/etc.) connects directly, bypassing any pooler —
  // the running app connects separately via DATABASE_URL in lib/prisma.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
