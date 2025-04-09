import { Database } from "@opencontrol/core/drizzle/index.js"
import { migrate } from "drizzle-orm/postgres-js/migrator"

export const handler = async (_event: any) => {
  await Database.use((db) =>
    migrate(db, {
      migrationsFolder: "./migrations",
    }),
  )
}
