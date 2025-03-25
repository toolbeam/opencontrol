import { createClient } from "@openauthjs/openauth/client"
import { Actor } from "@opencontrol/core/actor.js"
import { Log } from "@opencontrol/core/util/log.js"
import { Workspace } from "@opencontrol/core/workspace/index.js"
import { Hono } from "hono"
import { handle } from "hono/aws-lambda"
import { HTTPException } from "hono/http-exception"
import { Resource } from "sst"

const client = createClient({
  clientID: "api",
  issuer: Resource.Auth.url,
})

const log = Log.create({
  namespace: "api",
})

const app = new Hono()
  .use(async (c, next) => {
    const authorization = c.req.header("Authorization")
    if (authorization) {
      const [type, token] = authorization.split(" ")
      if (type !== "Bearer") {
        throw new HTTPException(401, {
          message: "Invalid authorization header",
        })
      }
      const verified = await client.verify(token)
      if (verified.err)
        throw new HTTPException(401, {
          message: verified.err.message,
        })

      return Actor.provide(
        verified.subject.type as any,
        verified.subject.properties,
        next,
      )
    }
    return Actor.provide("public", {}, next)
  })
  .get("/rest/account", async (c, next) => {
    const account = Actor.assert("account")
    let workspaces = await Workspace.list()
    if (workspaces.length === 0) {
      await Workspace.create()
      workspaces = await Workspace.list()
    }
    return c.json({
      id: account.properties.accountID,
      email: account.properties.email,
      workspaces,
    })
  })

export const handler = handle(app)
