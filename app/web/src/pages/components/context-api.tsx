import { hc } from "hono/client"
import { ApiType } from "@opencontrol/function/src/api"
import { useOpenAuth } from "@openauthjs/solid"
import { useWorkspace } from "./context-workspace"

export function useApi() {
  const workspace = useWorkspace()
  const auth = useOpenAuth()
  return hc<ApiType>(import.meta.env.VITE_API_URL, {
    async fetch(...args: Parameters<typeof fetch>): Promise<Response> {
      const [input, init] = args
      const request =
        input instanceof Request ? input : new Request(input, init)
      const headers = new Headers(request.headers)
      headers.set("authorization", `Bearer ${await auth.access()}`)
      headers.set("x-opencontrol-workspace", workspace.id)
      return fetch(
        new Request(request, {
          ...init,
          headers,
        }),
      )
    },
  })
}
