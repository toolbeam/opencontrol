import { create } from "opencontrol"
import { tool } from "opencontrol/tool"
import { z } from "zod"
import AWS from "aws-sdk"

const aws = tool({
  name: "aws",
  description: "Make a call to the AWS SDK for JavaScript v2",
  args: z.object({
    client: z.string().describe("Class name of the client to use"),
    command: z.string().describe("Command to call on the client"),
    args: z
      .record(z.string(), z.any())
      .optional()
      .describe("Arguments to pass to the command"),
  }),
  async run(input) {
    // @ts-ignore
    const client = new AWS[input.client]()
    return await client[input.command](input.args).promise()
  },
})

export default create({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  tools: [aws],
})
