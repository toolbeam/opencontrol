import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useAccount } from "../../components/context-account"
import { useWorkspace } from "../components/context-workspace"
import { Button } from "../../ui/button"
import Layout from "./components/Layout"
import { For } from "solid-js"

export default function Integrations() {
  const account = useAccount()
  const workspace = useWorkspace()
  const zero = useZero()
  const [awsAccounts] = useQuery(() => {
    return zero.query.aws_account.where("workspace_id", workspace.id)
  })
  return (
    <Layout>
      <div data-component="title-bar">
        <div data-slot="left">
          <h1>Integrations</h1>
        </div>
      </div>
      <div data-max-width>
        <For each={awsAccounts()}>
          {(awsAccount) => (
            <div>
              <h2>{awsAccount.account_number}</h2>
              <p>{awsAccount.region}</p>
            </div>
          )}
        </For>
        <Button
          onClick={() =>
            window.open(
              `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?param_workspaceID=${account.current!.workspaces[0].id}&stackName=OpenControl-${account.current!.workspaces[0].id.replace(/_/g, "-")}&templateURL=${import.meta.env.VITE_TEMPLATE_URL}`,
            )
          }
        >
          Connect AWS Console
        </Button>
      </div>
    </Layout>
  )
}
