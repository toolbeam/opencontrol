import { Hono } from "hono"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { basicAuth } from "hono/basic-auth"
import { cors } from "hono/cors"
import HTML from "opencontrol-frontend/dist/index.html" with { type: "text" }

export interface OpenControlOptions {
  key?: string
}

export function create(input: {
  tools: Tool[]
  key?: string
  anthropicApiKey?: string
}) {
  const mcp = createMcp({ tools: input.tools })

  return new Hono()
    .use(
      cors({
        origin: "*",
        allowHeaders: ["*"],
        allowMethods: ["GET"],
        credentials: false,
      }),
    )
    .use(
      basicAuth({
        username: "opencontrol",
        password: input.key || "password",
      }),
    )
    .get("/", (c) => {
      if (!input.anthropicApiKey)
        return c.text("Please set the anthropicApiKey to use built in chat")
      return c.html(
        HTML.replace("{ANTHROPIC_API_KEY}", input.anthropicApiKey || ""),
      )
    })
    .post("/mcp", async (c) => {
      const body = await c.req.json()
      console.log("mcp", "request", body)
      const result = await mcp.process(body)
      console.log("mcp", "result", result)
      return c.json(result)
    })
}
