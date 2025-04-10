import Layout from "./components/layout"
import { Button } from "../../ui/button"
import { useApi } from "../components/context-api"
import { createSignal } from "solid-js"
import { useZero } from "../components/context-zero"
import { useWorkspace } from "../components/context-workspace"
import { useQuery } from "@rocicorp/zero/solid"

export default function Billing() {
  const api = useApi()
  const zero = useZero()
  const workspace = useWorkspace()
  const [isLoading, setIsLoading] = createSignal(false)
  const [billingData] = useQuery(() => {
    return zero.query.billing.where("workspace_id", workspace.id)
  })

  const handleBuyCredits = async () => {
    try {
      setIsLoading(true)
      const response = await api.billing.checkout
        .$post({
          json: {
            return_url: window.location.href,
          },
        })
        .then((r) => r.json() as any)
      window.location.href = response.url
    } catch (error) {
      console.error("Failed to get checkout URL:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div data-component="title-bar">
        <div data-slot="left">
          <h1>Billing</h1>
        </div>
      </div>
      <div data-max-width>
        <div style="margin: 2rem 0;">
          <div style="margin-bottom: 1rem;">
            <h2>Current Balance</h2>
            <p style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">
              ${((billingData()?.[0]?.balance ?? 0) / 100).toFixed(2)}
            </p>
          </div>

          <Button onClick={handleBuyCredits} disabled={isLoading()}>
            {isLoading() ? "Loading..." : "Buy Credits"}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
