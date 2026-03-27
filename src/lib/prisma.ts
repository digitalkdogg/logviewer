import * as dotenv from "dotenv";
import * as path from "path";

// Absolute path to ensure it's loaded correctly on Linux
const envPath = path.resolve(process.cwd(), ".env.production");
dotenv.config({ path: envPath });

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let databaseUrl = process.env.DATABASE_URL;
  
  // If DATABASE_URL is missing, try to construct it from individual components
  if (!databaseUrl && process.env.DB_HOST) {
    const user = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '3306';
    const database = process.env.DB_DATABASE || process.env.DB_NAME || '';
    
    databaseUrl = `mysql://${user}:${password}@${host}:${port}/${database}`;
    console.log(`Constructed DATABASE_URL from individual components for host: ${host}`);
  }

  if (!databaseUrl) {
    const envPath = path.resolve(process.cwd(), ".env.production");
    throw new Error(`DATABASE_URL is not defined and could not be constructed from components in ${envPath}.`);
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
