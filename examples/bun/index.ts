import { create } from "opencontrol"
import { tool } from "opencontrol/tool"
import { z } from "zod"
import * as AWS from "aws-sdk"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"

const aws = tool({
  name: "aws",
  description: "Make a call to the AWS SDK for JavaScript v2",
  args: z.object({
    client: z.string().describe("Class name of the client to use"),
    command: z.string().describe("Function to call on the AWS sdk client"),
    params: z.string().describe("Arguments to pass to the command as JSON"),
  }),
  async run(input) {
    // @ts-ignore
    const client = AWS[input.client]
    if (!client) throw new Error(`Client ${input.client} not found`)
    const instance = new client()
    const cmd = instance[input.command]
    if (!cmd) throw new Error(`Command ${input.command} not found`)
    return await cmd(JSON.parse(input.params)).promise()
  },
})

export default create({
  tools: [aws],
  // model: anthropic("claude-3-7-sonnet-latest"),
  password: "password",
  model: google("gemini-2.5-pro-exp-03-25"),
  // model: openai("o3-mini"),
})
