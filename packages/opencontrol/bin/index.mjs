#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
const server = new Server({
  name: "opencontrol",
  version: "0.0.1",
})

class ProxyTransport {
  #stdio = new StdioServerTransport()
  async start() {
    this.#stdio.onmessage = (message) => {
      if ("id" in message) {
        fetch(process.argv[2] + "/mcp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }).then(async (response) => this.send(await response.json()))
        return
      }
      this.#stdio.send(message)
    }
    this.#stdio.onerror = (error) => {
      this.onerror?.(error)
    }
    await this.#stdio.start()
  }
  async send(message) {
    return this.#stdio.send(message)
  }
  close() {
    return this.#stdio.close()
  }
  onclose
  onerror
  onmessage
}
await server.connect(new ProxyTransport())
