import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { timestamps, workspaceColumns } from "./drizzle/types"
import { workspaceIndexes } from "./workspace/workspace.sql"

export const AwsAccountTable = pgTable(
  "aws_account",
  {
    ...workspaceColumns,
    ...timestamps,
    accountID: varchar("account_id", { length: 12 }).notNull(),
    region: varchar("region", { length: 32 }).notNull(),
  },
  (table) => [
    ...workspaceIndexes(table),
    uniqueIndex("account_id").on(table.workspaceID, table.accountID),
  ],
)
