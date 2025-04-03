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

// Use a secure key for localStorage to avoid exposing the purpose
const STORAGE_KEY = "oc:auth"

render(() => {
  const [ready, setReady] = createSignal(false)
  onMount(async () => {
    // Get password from localStorage
    setPassword(localStorage.getItem(STORAGE_KEY))
    while (true) {
      if (!password()) {
        const result = prompt("Enter password")
        if (!result) return
        localStorage.setItem(STORAGE_KEY, result)
        setPassword(result)
      }
      const result = await client.auth.$get()

      if (!result.ok) {
        localStorage.removeItem(STORAGE_KEY)
        setPassword(undefined)
        alert("Authentication failed")
        continue
      }
      setReady(true)
      break
    }
  })
  return (
    <Show when={ready()}>
      <App />
    </Show>
  )
}, root!)
