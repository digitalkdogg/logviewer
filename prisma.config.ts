
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  if (!host) throw new Error("DATABASE_URL or DB_HOST must be set in .env.production");

  const user = process.env.DB_USER ?? "";
  const password = process.env.DB_PASSWORD ?? "";
  const port = process.env.DB_PORT ?? "3306";
  const database = process.env.DB_DATABASE ?? process.env.DB_NAME ?? "";

  return `mysql://${user}:${password}@${host}:${port}/${database}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: getDatabaseUrl(),
  },
});
