/* @refresh reload */
import { render } from 'solid-js/web';
import SYSTEM_PROMPT from "./system.txt?raw"

import "./reset.css"
import './index.css';
import { LanguageModelV1Prompt } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);

const anthropic = createAnthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  headers: {
    "anthropic-dangerous-direct-browser-access": "true"
  },
})("claude-3-7-sonnet-20250219")

const openai = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
})("gpt-4o")

const provider = anthropic

const providerMetadata = {
  anthropic: {
    cacheControl: {
      type: "ephemeral",
    },
  },
}

const toolDefs = await fetch("http://localhost:3000/hello/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "tools/list",
    id: "1",
  }),
})
  .then((response) => response.json())
  .then((response) => response.result.tools)

function App() {

  async function send(message: string) {
    const prompt: LanguageModelV1Prompt = [
      {
        role: "system",
        providerMetadata,
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: message,
            providerMetadata,
          }
        ],
      }
    ]
    while (true) {
      const result = await provider.doGenerate({
        prompt,
        mode: {
          type: "regular",
          tools: toolDefs.map((tool: any) => ({
            type: "function",
            name: tool.name,
            description: tool.description,
            parameters: {
              type: "object",
              properties: {},
              additionalProperties: false,
              ...tool.input_schema,
            },
            function: async (args: any) => {
              const response = await fetch("http://localhost:3000/hello/mcp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  jsonrpc: "2.0",
                  method: "tools/call",
                  params: {
                    name: tool.name,
                    arguments: args,
                  },
                  id: "1",
                }),
              }).then((response) => response.json())
              return response.result.content[0]
            },
          })),
        },
        inputFormat: "messages",
        temperature: 1,
      })
      console.log(result)
      if (result.finishReason === "stop")
        break

      if (result.finishReason === "tool-calls") {
        for (const item of result.toolCalls!) {
          console.log("calling tool", item.toolName, item.args)
          prompt.push({
            role: "assistant",
            content: result.toolCalls!.map(item => ({
              type: "tool-call",
              toolName: item.toolName,
              args: JSON.parse(item.args),
              toolCallId: item.toolCallId,
            }))
          })
          const response = await fetch("http://localhost:3000/hello/mcp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "tools/call",
              params: {
                name: item.toolName,
                arguments: JSON.parse(item.args),
              },
              id: "1",
            }),
          }).then((response) => response.json())
          prompt.push({
            role: "tool",
            content: [{
              type: "tool-result",
              toolName: item.toolName,
              toolCallId: item.toolCallId,
              result: response,
            }],
          })
        }
      }
    }
  }


  return (
    <div data-component="root">
      <div data-component="messages">
      </div>
      <div data-component="footer">
        <div data-slot="chat">
          <textarea
            autofocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                send(e.currentTarget.value)
                e.currentTarget.value = ""
                e.preventDefault()
              }
            }}
            data-component="input" placeholder="Type your message here" />
        </div>
      </div>
    </div>
  );
}
