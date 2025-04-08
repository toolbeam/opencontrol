import { useAccount } from "../../components/context-account"
import { Button } from "../../ui/button"
import Layout from "./components/Layout"

export default function Integrations() {
  const account = useAccount()
  return (
    <Layout>
      <div data-max-width>
        <h1>Integrations</h1>
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
