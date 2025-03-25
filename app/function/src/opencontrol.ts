import { createAnthropic } from "@ai-sdk/anthropic"
import { create } from "opencontrol"
import { Resource } from "sst"
import { handle } from "hono/aws-lambda"
import { tools as sst } from "sst/opencontrol"
import { tool } from "opencontrol/tool"
import { z } from "zod"
import { Database } from "@opencontrol/core/drizzle/index.js"

const read = tool({
  name: "database_query_readonly",
  description:
    "Readonly database query for postgres, use this if there are no direct tools",
  args: z.object({ query: z.string() }),
  async run(input) {
    return Database.transaction(async (tx) => tx.execute(input.query), {
      accessMode: "read only",
      isolationLevel: "read committed",
    })
  },
})

const write = tool({
  name: "database_query_write",
  description:
    "Execute sql query for postgres. Make sure you confirm with the user before running the query",
  args: z.object({ query: z.string() }),
  async run(input) {
    return Database.transaction(async (tx) => tx.execute(input.query), {
      isolationLevel: "read committed",
    })
  },
})

const app = create({
  model: createAnthropic({
    apiKey: Resource.AnthropicApiKey.value,
  })("claude-3-7-sonnet-20250219"),
  // @ts-ignore
  tools: [read, write, ...sst],
})

export const handler = handle(app)
