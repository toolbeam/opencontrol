import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { LanguageModelV1Prompt } from "ai"
import { createEffect, For, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import SYSTEM_PROMPT from "./system.txt?raw"


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

export function App() {
  let root: HTMLDivElement | undefined

  const [store, setStore] = createStore<{
    prompt: LanguageModelV1Prompt,
    isProcessing: boolean
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
    isProcessing: false
  })

  createEffect(() => {
    const messages = store.prompt
    console.log("scrolling to bottom")
    root?.scrollTo(0, root?.scrollHeight)
    return messages.length
  }, 0)

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && store.isProcessing) {
        setStore("isProcessing", false);
        console.log("Processing cancelled by user");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    })
  })

  async function send(message: string) {
    setStore("isProcessing", true);
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
      if (!store.isProcessing) {
        console.log("Processing cancelled by user");
        break;
      }

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

        if (!store.isProcessing) continue

        if (result.text) {
          setStore("prompt", store.prompt.length, {
            role: "assistant",
            content: [{
              type: "text",
              text: result.text,
            }]
          })
        }

        if (result.finishReason === "stop") {
          setStore("isProcessing", false);
          break;
        }

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
      } catch (error) {
        console.error("Error in message processing:", error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
    setStore("isProcessing", false);
  }



  return (
    <div data-component="root" ref={root}>
      <div data-component="messages">
        <For each={store.prompt}>
          {(item) => (
            <>
              {item.role === "user" && item.content[0].type === "text" &&
                <div data-slot="message" data-user={true}>
                  {item.content[0].text}
                </div>
              }

              {item.role === "assistant" && item.content[0].type === "tool-call" &&
                (() => {
                  const [showArgs, setShowArgs] = createStore({
                    visible: false
                  });

                  const toggleArgs = () => {
                    setShowArgs("visible", prev => !prev);
                  };

                  return (
                    <div data-slot="message" data-tool={true}>
                      <div data-slot="tool-header" onClick={toggleArgs}>
                        <span data-slot="tool-icon">🔧</span>
                        <span data-slot="tool-name">{item.content[0].toolName}</span>
                        <span data-slot="tool-expand">{showArgs.visible ? "−" : "+"}</span>
                      </div>
                      {showArgs.visible && (
                        <div data-slot="tool-args">
                          <pre>{JSON.stringify(item.content[0].args, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })()
              }

              {/* Show assistant text messages */}
              {item.role === "assistant" && item.content[0].type === "text" &&
                <div data-slot="message" data-assistant={true}>
                  {item.content[0].text}
                </div>
              }

              {/* Show system messages, but not the first ones (initial prompts) */}
              {item.role === "system" &&
                store.prompt.indexOf(item) > 1 &&
                <div data-slot="message" data-system={true}>
                  {item.content}
                </div>
              }
            </>
          )}
        </For>
        {/* Loading indicator bar */}
        {store.isProcessing && (
          <div data-slot="thinking-bar">
            <div data-slot="thinking-spinner">
              <div data-slot="spinner-inner"></div>
            </div>
            <div data-slot="thinking-text">Thinking</div>
          </div>
        )}

        <div data-slot="spacer"></div>
      </div>
      <div data-component="footer">
        <div data-slot="chat">
          <textarea
            autofocus
            disabled={store.isProcessing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !store.isProcessing) {
                send(e.currentTarget.value)
                e.currentTarget.value = ""
                e.preventDefault()
              }
            }}
            data-component="input" placeholder={store.isProcessing ? "Processing..." : "Type your message here"} />
        </div>
      </div>
    </div>
  );
}
