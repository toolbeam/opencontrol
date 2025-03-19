/* @refresh reload */
import { render } from "solid-js/web"

import "./reset.css"
import "./index.css"
import { App } from "./app"
import { createSignal, onMount, Show } from "solid-js"
import { client, password, setPassword } from "./client"

const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  )
}

render(() => {
  const [ready, setReady] = createSignal(false)
  onMount(async () => {
    setPassword(localStorage.getItem("opencontrol:password"))
    while (true) {
      if (!password()) {
        const result = prompt("Enter password")
        if (!result)
          return
        localStorage.setItem("opencontrol:password", result)
        setPassword(result)
      }
      const result = await client.auth.$get({
        json: {
          jsonrpc: "2.0",
          method: "initialize",
          id: "1",
        }
      })

      if (!result.ok) {
        localStorage.removeItem("opencontrol:password")
        setPassword(undefined)
        alert("bad password")
        continue
      }
      setReady(true)
      break
    }

  })
  return <Show when={ready()}><App /></Show>
}, root!)
