import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { basicAuth } from "hono/basic-auth"

import { generateText } from "ai"
import { cors } from "hono/cors"

export interface OpenControlOptions {
  key?: string
}

export function create(input: { tools: Tool[]; key?: string }) {
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
    .route(
      ":key",
      new Hono()
        .use((c, next) => {
          const key = c.req.param("key")
          if (key !== input.key) {
            throw new HTTPException(401)
          }
          return next()
        })
        .post("/mcp", async (c) => {
          const body = await c.req.json()
          console.log("mcp", "request", body)
          const result = await mcp.process(body)
          console.log("mcp", "result", result)
          return c.json(result)
        })
        .use(
          basicAuth({
            username: "opencontrol",
            password: input.key || "password",
          }),
        ),
    )
}
