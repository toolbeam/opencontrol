import { createToolCaller } from "./components/tool";

export default function () {
  const toolCaller = createToolCaller({
    tool: {
      list: async () => [{
        name: "test",
        description: "this is a test tool",
        inputSchema: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
          },
        },
      }]
      call: () => Promise.resolve({}),
    },
    generate: () => Promise.resolve({}),
  })
}
