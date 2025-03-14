import { Hono } from "hono"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { basicAuth } from "hono/basic-auth"
import { cors } from "hono/cors"
import HTML from "opencontrol-frontend/dist/index.html" with { type: "text" }
import { setCookie, getCookie } from "hono/cookie"

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
    .get("/login/:key", (c) => {
      setCookie(c, "key", c.req.param("key"), {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      })
      return c.redirect("/")
    })
    .use(async (c, next) => {
      const key = getCookie(c, "key")
      if (key !== input.key) return c.text("login at /login/:key")
      return next()
    })
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
