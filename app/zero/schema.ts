import {
  createSchema,
  definePermissions,
  table,
  string,
  number,
  relationships,
  ExpressionBuilder,
  ANYONE_CAN,
} from "@rocicorp/zero"

const timestamps = {
  time_created: number(),
  time_deleted: number().optional(),
} as const

const workspace = table("workspace")
  .columns({
    id: string(),
    slug: string(),
    ...timestamps,
  })
  .primaryKey("id")

const user = table("user")
  .columns({
    id: string(),
    workspace_id: string(),
    email: string(),
    name: string().optional(),
    time_created: number(),
    time_deleted: number().optional(),
    time_seen: number().optional(),
    color: number().optional(),
  })
  .primaryKey("workspace_id", "id")

export const schema = createSchema({
  tables: [workspace, user],
  relationships: [
    relationships(user, (r) => ({
      workspace: r.one({
        sourceField: ["workspace_id"],
        destSchema: workspace,
        destField: ["id"],
      }),
      users: r.many({
        sourceField: ["workspace_id"],
        destSchema: user,
        destField: ["workspace_id"],
      }),
    })),
    relationships(workspace, (r) => ({
      users: r.many({
        sourceField: ["id"],
        destSchema: user,
        destField: ["workspace_id"],
      }),
    })),
  ],
})

export type Schema = typeof schema

type Auth = {
  sub: string
  properties: {
    accountID: string
    email: string
  }
}

export const permissions = definePermissions<Auth, Schema>(schema, () => {
  const allowWorkspace = (
    authData: Auth,
    q: ExpressionBuilder<Schema, keyof Schema["tables"]>,
  ) => q.exists("users", (u) => u.where("email", authData.sub))

  return {
    user: {
      row: {
        select: [
          (auth, q) => q.exists("users", (u) => u.where("email", auth.sub)),
        ],
        update: {
          preMutation: [allowWorkspace],
          postMutation: ANYONE_CAN,
        },
      },
    },
    workspace: {
      row: {
        select: [
          (auth, q) => q.exists("users", (u) => u.where("email", auth.sub)),
        ],
      },
    },
  }
})
