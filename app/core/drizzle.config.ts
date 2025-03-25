import { defineConfig } from "drizzle-kit"
import { Resource } from "sst"

export default defineConfig({
  out: "./migrations/",
  strict: true,
  schema: ["./src/**/*.sql.ts"],
  verbose: true,
  dialect: "postgresql",
  dbCredentials: {
    database: Resource.Postgres.database,
    host: Resource.Postgres.host,
    user: Resource.Postgres.username,
    password: Resource.Postgres.password,
    port: Resource.Postgres.port,
    ssl: {
      rejectUnauthorized: false,
    },
  },
})
