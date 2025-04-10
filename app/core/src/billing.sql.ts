import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core"
import { timestamps, workspaceColumns } from "./drizzle/types"
import { workspaceIndexes } from "./workspace/workspace.sql"

export const BillingTable = pgTable(
  "billing",
  {
    ...workspaceColumns,
    ...timestamps,
    customerID: varchar("customer_id", { length: 255 }),
    balance: integer("balance").notNull(),
    reload: boolean("reload"),
  },
  (table) => [...workspaceIndexes(table)],
)

export const PaymentTable = pgTable(
  "payment",
  {
    ...workspaceColumns,
    ...timestamps,
    customerID: varchar("customer_id", { length: 255 }),
    paymentID: varchar("payment_id", { length: 255 }),
    amount: integer("amount").notNull(),
  },
  (table) => [...workspaceIndexes(table)],
)

export const UsageTable = pgTable(
  "usage",
  {
    ...workspaceColumns,
    ...timestamps,
    requestID: varchar("request_id", { length: 255 }),
    model: varchar("model", { length: 255 }).notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    cost: integer("cost").notNull(),
  },
  (table) => [...workspaceIndexes(table)],
)
