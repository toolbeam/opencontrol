import { Resource } from "sst"
import { Stripe } from "stripe"
import { Database, eq, sql } from "./drizzle"
import { BillingTable, UsageTable } from "./billing.sql"
import { Actor } from "./actor"
import { fn } from "./util/fn"
import { z } from "zod"
import { Identifier } from "./identifier"

export namespace Billing {
  export const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2025-03-31.basil",
  })

  export const get = async () => {
    return Database.use(async (tx) =>
      tx
        .select({
          customerID: BillingTable.customerID,
          balance: BillingTable.balance,
          reload: BillingTable.reload,
        })
        .from(BillingTable)
        .where(eq(BillingTable.workspaceID, Actor.workspace()))
        .then((r) => r[0]),
    )
  }

  export const consume = fn(
    z.object({
      requestID: z.string().optional(),
      model: z.string(),
      inputTokens: z.number(),
      outputTokens: z.number(),
      cost: z.number(),
    }),
    async (input) => {
      const workspaceID = Actor.workspace()

      await Database.transaction(async (tx) => {
        await tx.insert(UsageTable).values({
          workspaceID,
          id: Identifier.create("usage"),
          requestID: input.requestID,
          model: input.model,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          cost: input.cost,
        })
        await tx
          .update(BillingTable)
          .set({
            balance: sql`${BillingTable.balance} - ${input.cost}`,
          })
          .where(eq(BillingTable.workspaceID, workspaceID))
      })
    },
  )
}
