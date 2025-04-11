import { Resource } from "sst"
import { Stripe } from "stripe"
import { Database, eq, sql } from "./drizzle"
import { BillingTable, PaymentTable, UsageTable } from "./billing.sql"
import { Actor } from "./actor"
import { fn } from "./util/fn"
import { z } from "zod"
import { Identifier } from "./identifier"
import { centsToMicroCents } from "./util/price"

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

  export const addFunds = fn(
    z.object({
      amountInCents: z.number(),
      paymentID: z.string(),
      customerID: z.string(),
    }),
    async (input) => {
      const workspaceID = Actor.workspace()
      await Database.transaction(async (tx) => {
        await tx
          .update(BillingTable)
          .set({
            balance: sql`${BillingTable.balance} + ${centsToMicroCents(input.amountInCents)}`,
            customerID: input.customerID,
          })
          .where(eq(BillingTable.workspaceID, workspaceID))
        await tx.insert(PaymentTable).values({
          workspaceID,
          id: Identifier.create("payment"),
          amount: centsToMicroCents(input.amountInCents),
          paymentID: input.paymentID,
          customerID: input.customerID,
        })
      })
    },
  )

  export const consume = fn(
    z.object({
      requestID: z.string().optional(),
      model: z.string(),
      inputTokens: z.number(),
      outputTokens: z.number(),
      costInCents: z.number(),
    }),
    async (input) => {
      const workspaceID = Actor.workspace()
      const cost = centsToMicroCents(input.costInCents)

      return await Database.transaction(async (tx) => {
        await tx.insert(UsageTable).values({
          workspaceID,
          id: Identifier.create("usage"),
          requestID: input.requestID,
          model: input.model,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          cost,
        })
        const [updated] = await tx
          .update(BillingTable)
          .set({
            balance: sql`${BillingTable.balance} - ${cost}`,
          })
          .where(eq(BillingTable.workspaceID, workspaceID))
          .returning()
        return updated.balance
      })
    },
  )
}
