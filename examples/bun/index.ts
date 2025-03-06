import { create } from "opencontrol"
import { tool } from "opencontrol/tool"

export default create({
  key: "hello",
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
