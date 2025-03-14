import { create } from "opencontrol"
import { tool } from "opencontrol/tool"

export default create({
  key: "hello",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  tools: [
    tool({
      name: "hello",
      description: "say hello",
      run: async () => {
        return "Hey there!"
      },
    }),
  ],
})
