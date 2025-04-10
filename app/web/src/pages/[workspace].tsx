import { ZeroProvider } from "./components/context-zero"
import { WorkspaceProvider } from "./components/context-workspace"
import { ParentProps } from "solid-js"

export default function Index(props: ParentProps) {
  return (
    <WorkspaceProvider>
      <ZeroProvider>{props.children}</ZeroProvider>
    </WorkspaceProvider>
  )
}
