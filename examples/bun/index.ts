import { create } from "opencontrol"
import { tool } from "opencontrol/tool"
import { z } from "zod"
import AWS from "aws-sdk"
import { anthropic } from "@ai-sdk/anthropic"

const aws = tool({
  name: "aws",
  description: "Make a call to the AWS SDK for JavaScript v2",
  args: z.object({
    client: z.string().describe("Class name of the client to use"),
    command: z.string().describe("Command to call on the client"),
    args: z
      .record(z.string(), z.any())
      .optional()
      .describe("Arguments to pass to the command as json"),
  }),
  async run(input) {
    // @ts-ignore
    const client = AWS[input.client]
    if (!client) throw new Error(`Client ${input.client} not found`)
    const instance = new client()
    return await instance[input.command](input.args).promise()
  },
})

export default create({
  tools: [aws],
  model: anthropic("claude-3-7-sonnet-latest"),
  password: "password",
  // model: google("gemini-2.0-flash-exp"),
  // model: openai("o3-mini"),
})
