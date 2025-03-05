import { type Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { type JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

class OpenControlTransport implements Transport {
  constructor(private cb: (response: JSONRPCMessage) => void) {}
  async start(): Promise<void> {}
  async send(message: JSONRPCMessage): Promise<void> {
    this.cb(message);
  }
  async close(): Promise<void> {}
  onclose?: (() => void) | undefined;
  onerror?: ((error: Error) => void) | undefined;
  onmessage?: ((message: JSONRPCMessage) => void) | undefined;
}

export interface OpenControlOptions {
  key?: string;
}

export function create(
  server: { connect: (transport: Transport) => Promise<void> },
  options?: OpenControlOptions,
) {
  return new Hono()
    .use((c, next) => {
      if (options?.key) {
        const authorization = c.req.header("Authorization");
        if (authorization !== `Bearer ${options?.key}`) {
          throw new HTTPException(401);
        }
      }
      return next();
    })
    .post("/mcp", async (c) => {
      const body = await c.req.json();
      console.log("<-", body);
      const response = await new Promise<any>(async (resolve) => {
        const transport = new OpenControlTransport(resolve);
        console.log("connecting to transport");
        await server.connect(transport);
        console.log("connected to transport");
        transport.onmessage?.(body);
      });
      console.log("->", JSON.stringify(response, null, 2));
      return c.json(response);
    });
}
