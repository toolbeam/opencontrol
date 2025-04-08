import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useAccount } from "../../components/context-account"
import { useWorkspace } from "../components/context-workspace"
import { Button } from "../../ui/button"
import Layout from "./components/Layout"
import { For, createSignal } from "solid-js"
import style from "./integrations.module.css"

export default function Integrations() {
  const account = useAccount()
  const workspace = useWorkspace()
  const zero = useZero()
  const [awsAccounts] = useQuery(() => {
    return zero.query.aws_account.where("workspace_id", workspace.id)
  })

  // Dummy data for demonstration
  const [dummyAccounts, setDummyAccounts] = createSignal([
    { id: "1", account_number: "123456789012", region: "us-east-1" },
    { id: "2", account_number: "098765432109", region: "us-west-2" },
  ])

  const handleRemoveAccount = (id: string) => {
    console.log(`Removing account ${id}`)
    setDummyAccounts(prev => prev.filter(acc => acc.id !== id))
  }

  const handleConnectAWS = () => {
    window.open(
      `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?param_workspaceID=${account.current!.workspaces[0].id}&stackName=OpenControl-${account.current!.workspaces[0].id.replace(/_/g, "-")}&templateURL=${import.meta.env.VITE_TEMPLATE_URL}`,
    )
  }

  return (
    <Layout>
      <div data-component="title-bar">
        <div data-slot="left">
          <h1>Integrations</h1>
        </div>
      </div>

      <div class={style.root} data-max-width data-max-width-64>
        <div data-slot="aws-accounts">
          <div data-slot="header">
            <h2>AWS</h2>
            <p>Connect your AWS accounts.</p>
          </div>

          {dummyAccounts().length === 0 ? (
            <div data-slot="empty-state">
              <p>Connect your AWS account to get started.</p>
              <Button color="primary" onClick={handleConnectAWS}>
                Connect AWS
              </Button>
            </div>
          ) : (
            <div data-slot="list">
              <For each={dummyAccounts()}>
                {(account) => (
                  <div data-slot="item">
                    <div data-slot="account">
                      <span data-slot="number">{account.account_number}</span>
                    </div>
                    <Button
                      color="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </For>
              <div data-slot="item" data-connect>
                <span>Add another account</span>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleConnectAWS}
                >
                  Connect
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
