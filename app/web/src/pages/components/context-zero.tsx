import { Zero } from "@rocicorp/zero"
import { useParams } from "@solidjs/router"
import { schema } from "@opencontrol/zero/schema"
import { createInitializedContext } from "../../util/context"
import { useOpenAuth } from "@openauthjs/solid"
import { useAccount } from "../../components/context-account"
import { useWorkspace } from "./context-workspace"

export const { use: useZero, provider: ZeroProvider } =
  createInitializedContext("ZeroContext", () => {
    const workspace = useWorkspace()
    const auth = useOpenAuth()
    const account = useAccount()
    const zero = new Zero({
      auth: auth.access,
      server: import.meta.env.VITE_ZERO_URL,
      userID: account.current!.email,
      storageKey: workspace.id,
      schema,
    })

    zero.query.user.where("workspace_id", workspace.id).preload({
      ttl: "forever",
    })
    zero.query.workspace.where("id", workspace.id).preload({
      ttl: "forever",
    })
    zero.query.aws_account.where("workspace_id", workspace.id).preload({
      ttl: "forever",
    })

    return {
      mutate: zero.mutate,
      query: zero.query,
      ready: true,
    }
  })
