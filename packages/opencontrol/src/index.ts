import { Hono } from "hono"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { cors } from "hono/cors"
import HTML from "opencontrol-frontend/dist/index.html" with { type: "text" }
import { zValidator } from "@hono/zod-validator"
import {
  AISDKError,
  APICallError,
  LanguageModelV1,
  LanguageModelV1CallOptions,
} from "ai"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"
import { bearerAuth } from "hono/bearer-auth"
import defaultSystemPrompt from "./system.txt" with { type: "text" }

export interface OpenControlOptions {
  tools: Tool[]
  password?: string
  model?: LanguageModelV1
  app?: Hono
  systemPrompt?: string
}

export type App = ReturnType<typeof create>

export function create(input: OpenControlOptions) {
  const mcp = createMcp({ tools: input.tools })
  const token =
    input.password ||
    process.env.OPENCONTROL_PASSWORD ||
    process.env.OPENCONTROL_KEY ||
    "password"
  const systemPrompt = input.systemPrompt ?? defaultSystemPrompt
  console.log("opencontrol password:", token)
  console.log("opencontrol system prompt:", systemPrompt)
  const app = input.app ?? new Hono()
  return app
    .use(
      cors({
        origin: "*",
        allowHeaders: ["*"],
        allowMethods: ["GET"],
        credentials: false,
      }),
    )
    .get("/", (c) => {
      return c.html(HTML)
    })
    .use(
      bearerAuth({
        token,
      }),
    )
    .get("/auth", (c) => {
      return c.json({
        systemPrompt,
      })
    })
    .post(
      "/generate",
      zValidator("json", z.custom<LanguageModelV1CallOptions>()),
      async (c) => {
        if (!input.model)
          throw new HTTPException(400, { message: "No model configured" })
        const body = c.req.valid("json")
        try {
          const result = await input.model.doGenerate(body)
          return c.json(result)
        } catch (error) {
          if (error instanceof APICallError) {
            throw new HTTPException(error.statusCode || (500 as any), {
              message: "error",
            })
          }
          throw new HTTPException(500, { message: "error" })
        }
      },
    )
    .post("/mcp", async (c) => {
      const body = await c.req.json()
      const result = await mcp.process(body)
      return c.json(result)
    })
}
