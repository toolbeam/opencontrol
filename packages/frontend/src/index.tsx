/* @refresh reload */
import { For, render } from 'solid-js/web';
import SYSTEM_PROMPT from "./system.txt?raw"
import { createStore } from "solid-js/store"

import "./reset.css"
import './index.css';
import { LanguageModelV1Prompt } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createEffect } from 'solid-js';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);

const anthropic = createAnthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "{ANTHROPIC_API_KEY}",
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

const OPENCONTROL_ENDPOINT = import.meta.env.VITE_OPENCONTROL_ENDPOINT || "mcp"
const toolDefs = await fetch(OPENCONTROL_ENDPOINT, {
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
  let root: HTMLDivElement | undefined

  const [store, setStore] = createStore<{
    prompt: LanguageModelV1Prompt
  }>({
    prompt: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
        providerMetadata: {
          anthropic: {
            cacheControl: {
              type: "ephemeral",
            },
          },
        },
      },
      {
        role: "system",
        content: `The current date is ${new Date().toDateString()}`,
        providerMetadata: {
          anthropic: {
            cacheControl: {
              type: "ephemeral",
            },
          },
        },
      }
    ],
  })

  createEffect(() => {
    const messages = store.prompt
    console.log("scrolling to bottom")
    root?.scrollTo(0, root?.scrollHeight)
    return messages.length
  }, 0)

  async function send(message: string) {
    setStore("prompt",
      store.prompt.length,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: message,
            providerMetadata: store.prompt.length === 1 ? providerMetadata : {},
          }
        ],
      }
    )
    while (true) {
      try {
        const result = await provider.doGenerate({
          prompt: store.prompt,
          mode: {
            type: "regular",
            tools: toolDefs.map((tool: any) => ({
              type: "function",
              name: tool.name,
              description: tool.description,
              parameters: {
                ...tool.inputSchema,
              },
            })),
          },
          inputFormat: "messages",
          temperature: 1,
        })

        if (result.text) {
          setStore("prompt", store.prompt.length, {
            role: "assistant",
            content: [{
              type: "text",
              text: result.text,
            }]
          })
        }

        if (result.finishReason === "stop")
          break
        if (result.finishReason === "tool-calls") {
          for (const item of result.toolCalls!) {
            console.log("calling tool", item.toolName, item.args)
            setStore("prompt", store.prompt.length, {
              role: "assistant",
              content: result.toolCalls!.map(item => ({
                type: "tool-call",
                toolName: item.toolName,
                args: JSON.parse(item.args),
                toolCallId: item.toolCallId,
              }))
            })
            const response = await fetch(OPENCONTROL_ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: "2",
                method: "tools/call",
                params: {
                  name: item.toolName,
                  arguments: JSON.parse(item.args),
                },
              }),
            }).then((response) => response.json())
            setStore("prompt", store.prompt.length, {
              role: "tool",
              content: [{
                type: "tool-result",
                toolName: item.toolName,
                toolCallId: item.toolCallId,
                result: response.result.content,
              }],
            })
          }
        }
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }
    }
  }



  return (
    <div data-component="root" ref={root}>
      <div data-component="messages">
        <For each={store.prompt}>
          {(item) => (
            <>
              {item.role === "user" && item.content[0].type === "text" && <div data-slot="message">USER: {item.content[0].text}</div>}
              {item.role === "assistant" && item.content[0].type === "tool-call" &&
                <>
                  <div data-slot="message">TOOL: {item.content[0].toolName}</div>
                  <div data-slot="message">{"    "}↳ {JSON.stringify(item.content[0].args)}</div>
                </>
              }
              {item.role === "assistant" && item.content[0].type === "text" && <div data-slot="message">CTRL: {item.content[0].text}</div>}
            </>
          )}
        </For>
        <div data-slot="spacer"></div>
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
