import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import * as path from "path";

// Load from .env.production
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.2.172', 'localhost:3002'],
};

export default nextConfig;
