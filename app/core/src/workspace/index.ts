import { z } from "zod"
import { fn } from "../util/fn"
import { Actor } from "../actor"
import { Database, eq } from "../drizzle"
import { Identifier } from "../identifier"
import { WorkspaceTable } from "./workspace.sql"
import { UserTable } from "../user/user.sql"
import { BillingTable } from "../billing.sql"
import { Billing } from "../billing"
import { centsToMicroCents } from "../util/price"

export namespace Workspace {
  export const create = fn(z.void(), async () => {
    const account = Actor.assert("account")
    const workspaceID = Identifier.create("workspace")
    await Database.transaction(async (tx) => {
      await tx.insert(WorkspaceTable).values({
        id: workspaceID,
      })
      await tx.insert(UserTable).values({
        workspaceID,
        id: Identifier.create("user"),
        email: account.properties.email,
        name: "",
      })
      await tx.insert(BillingTable).values({
        workspaceID,
        id: Identifier.create("billing"),
        balance: centsToMicroCents(100),
      })
    })
    return workspaceID
  })

  export async function list() {
    const account = Actor.assert("account")
    return Database.use(async (tx) => {
      return tx
        .select({
          id: WorkspaceTable.id,
          slug: WorkspaceTable.slug,
          name: WorkspaceTable.name,
        })
        .from(UserTable)
        .innerJoin(WorkspaceTable, eq(UserTable.workspaceID, WorkspaceTable.id))
        .where(eq(UserTable.email, account.properties.email))
    })
  }
}
