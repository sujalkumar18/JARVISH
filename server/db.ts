import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use environment DATABASE_URL or fallback for development
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/replit_db';

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
