import type { Config } from "drizzle-kit";
import 'dotenv/config'

export default {
  schema: "./db/cloudboard.db.ts",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URI as string,
  }
} satisfies Config;