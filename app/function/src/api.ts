import AWS from "aws-sdk"
import { createClient } from "@openauthjs/openauth/client"
import { Actor } from "@opencontrol/core/actor.js"
import { Log } from "@opencontrol/core/util/log.js"
import { Workspace } from "@opencontrol/core/workspace/index.js"
import { Database, eq, and } from "@opencontrol/core/drizzle/index.js"
import { Hono, MiddlewareHandler } from "hono"
import { handle } from "hono/aws-lambda"
import { HTTPException } from "hono/http-exception"
import { Resource } from "sst"
import { createAnthropic } from "@ai-sdk/anthropic"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { APICallError } from "ai"
import { WorkspaceTable } from "@opencontrol/core/workspace/workspace.sql.js"
import { AwsAccountTable } from "@opencontrol/core/aws.sql.js"
import { Identifier } from "@opencontrol/core/identifier.js"
import { Aws } from "@opencontrol/core/aws.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListToolsResult,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js"
import { UserTable } from "@opencontrol/core/user/user.sql.js"

const model = createAnthropic({
  apiKey: Resource.AnthropicApiKey.value,
})("claude-3-7-sonnet-20250219")

const client = createClient({
  clientID: "api",
  issuer: Resource.Auth.url,
})

const log = Log.create({
  namespace: "api",
})

export const AuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header("authorization")
  if (!authorization) {
    return Actor.provide("public", {}, next)
  }
  const token = authorization.split(" ")[1]
  if (!token)
    throw new HTTPException(403, {
      message: "Bearer token is required.",
    })

  const verified = await client.verify(token)
  if (verified.err) {
    throw new HTTPException(403, {
      message: "Invalid token.",
    })
  }
  let subject = verified.subject as Actor.Info
  if (subject.type === "account") {
    const workspaceID = c.req.header("x-opencontrol-workspace")
    const email = subject.properties.email
    if (workspaceID) {
      const user = await Database.use((tx) =>
        tx
          .select({
            id: UserTable.id,
            workspaceID: UserTable.workspaceID,
          })
          .from(UserTable)
          .where(
            and(
              eq(UserTable.email, email),
              eq(UserTable.workspaceID, workspaceID),
            ),
          )
          .then((rows) => rows[0]),
      )
      if (!user)
        throw new HTTPException(403, {
          message: "You do not have access to this workspace.",
        })
      subject = {
        type: "user",
        properties: {
          userID: user.id,
          workspaceID: workspaceID,
        },
      }
    }
  }
  await Actor.provide(subject.type, subject.properties, next)
}

const app = new Hono()
  .use(AuthMiddleware)
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
  .post("/ai_generate", zValidator("json", z.custom<any>()), async (c) => {
    const body = c.req.valid("json")
    try {
      const result = await model.doGenerate(body)
      return c.json(result)
    } catch (error) {
      if (error instanceof APICallError) {
        return c.json(
          {
            err: "unknown",
            message: error.message,
          },
          (error.statusCode || 500) as any,
        )
      }
    }
  })
  .post(
    "/aws/connect",
    zValidator(
      "json",
      z.custom<{
        workspaceID: string
        region: string
        role: string
      }>(),
    ),
    async (c) => {
      const { workspaceID, region, role } = c.req.valid("json")
      return Actor.provide("system", { workspaceID }, async () => {
        const accountNumber = role.split(":")[4]

        // Validate workspace id
        const workspace = await Database.use((tx) =>
          tx
            .select({})
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.id, workspaceID)),
        )
        if (!workspace)
          throw new HTTPException(500, { message: "Invalid workspace ID" })

        // Validate role by assuming it
        if (!role.endsWith(`role/opencontrol-${workspaceID}-${region}`))
          throw new HTTPException(500, { message: "Invalid role name" })
        await Aws.assumeRole({ accountNumber, region })

        await Database.use((tx) =>
          tx
            .insert(AwsAccountTable)
            .values({
              id: Identifier.create("awsAccount"),
              workspaceID,
              accountNumber,
              region,
            })
            .onConflictDoUpdate({
              target: [
                AwsAccountTable.workspaceID,
                AwsAccountTable.accountNumber,
              ],
              set: {
                region,
                timeDeleted: null,
              },
            }),
        )

        return c.json({
          message: "ok",
        })
      })
    },
  )
  .post(
    "/mcp",
    zValidator(
      "json",
      z.discriminatedUnion("method", [
        ListToolsRequestSchema,
        CallToolRequestSchema,
      ]),
    ),
    async (c) => {
      const body = c.req.valid("json")
      switch (body.method) {
        case "tools/list": {
          const result: ListToolsResult = {
            tools: await Database.use((tx) =>
              tx
                .select({})
                .from(AwsAccountTable)
                .where(eq(AwsAccountTable.workspaceID, Actor.workspace())),
            ).then((rows) =>
              rows.map((item): ListToolsResult["tools"][number] => ({
                name: "aws",
                description: `This uses aws sdk v2 in javascript to execute aws commands
                this is roughly how it works
                \`\`\`js
                import aws from "aws-sdk";
                aws[service][method](params)
                \`\`\``,
                inputSchema: {
                  type: "object",
                  properties: {
                    service: {
                      type: "string",
                      description:
                        "name of the aws service in the format aws sdk v2 uses, like S3 or EC2",
                    },
                    method: {
                      type: "string",
                      description:
                        "name of the aws method in the format aws sdk v2 uses",
                    },
                    params: {
                      type: "string",
                      description: "params for the aws method in json format",
                    },
                  },
                },
              })),
            ),
          }
          return c.json(result)
        }
        case "tools/call": {
          try {
            if (body.params.name === "aws") {
              const awsAccount = await Database.use((tx) =>
                tx
                  .select({
                    accountNumber: AwsAccountTable.accountNumber,
                    region: AwsAccountTable.region,
                  })
                  .from(AwsAccountTable)
                  .where(eq(AwsAccountTable.workspaceID, Actor.workspace())),
              )
              if (!awsAccount) {
                throw new Error(
                  "AWS integration not found. Please connect your AWS account first.",
                )
              }

              // Assume role
              const credentials = await Aws.assumeRole({
                accountNumber: awsAccount[0].accountNumber,
                region: awsAccount[0].region,
              })

              const { service, method, params } = body.params.arguments || {}

              /* @ts-expect-error */
              const client = AWS[service]
              if (!client) {
                throw new Error(
                  `service "${service}" is not found in aws sdk v2`,
                )
              }
              const instance = new client({
                credentials: {
                  accessKeyId: credentials.AccessKeyId,
                  secretAccessKey: credentials.SecretAccessKey,
                  sessionToken: credentials.SessionToken,
                },
              })
              if (!instance[method]) {
                throw new Error(
                  `method "${method}" is not found in on the ${service} service of aws sdk v2`,
                )
              }
              const response = await instance[method](
                JSON.parse(params as string),
              ).promise()
              const result: CallToolResult = {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(response),
                  },
                ],
              }
              return c.json(result)
            }
          } catch (error: any) {
            const result: CallToolResult = {
              isError: true,
              content: [
                {
                  type: "text",
                  text: error.toString(),
                },
              ],
            }
            return c.json(result)
          }
          throw new HTTPException(500, {
            message: `tool "${body.params.name}" is not found`,
          })
        }
      }
    },
  )

export type ApiType = typeof app
export const handler = handle(app)
