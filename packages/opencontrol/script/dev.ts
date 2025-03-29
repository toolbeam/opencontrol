import { create } from "../src/index.js"
import { tool } from "../src/tool.js"
import { z } from "zod"
import { createAnthropic } from "@ai-sdk/anthropic"
import { logger } from "hono/logger"
import { Hono } from "hono"

const pingPongTool = tool({
  name: "ping_pong_tool",
  description: "when I ping, I get a pong",
  args: z.object({
    input: z
      .union([z.literal("ping"), z.literal("pong")])
      .describe("either ping or pong"),
  }),
  async run(input) {
    if (input.input === "ping") {
      return "pong"
    }
    return "ping"
  },
})

const hono = new Hono()

hono.use(logger())

const app = create({
  tools: [pingPongTool],
  model: createAnthropic({ apiKey: Bun.env.CLAUDE_API_KEY })(
    "claude-3-7-sonnet-latest",
  ),
  password: "password",
  app: hono,
  systemPrompt:
    "You are useless ping-pong tool. Ping or pong as necessary please",
})

export default {
  port: Bun.env.PORT,
  fetch: app.fetch,
}
