import style from "../index.module.css"
import { useOpenAuth } from "@openauthjs/solid"
import { useAccount } from "../../../components/context-account"
import { Button } from "../../../ui/button"
import { IconLogomark } from "../../../ui/svg"
import { ParentProps, createMemo } from "solid-js"
import { A, useLocation } from "@solidjs/router"

export default function Layout(props: ParentProps) {
  const auth = useOpenAuth()
  const account = useAccount()
  const location = useLocation()

  const workspaceId = createMemo(() => account.current?.workspaces[0].id)

  const currentPath = createMemo(() => {
    // Extract the last part of the path
    const path = location.pathname
    const segments = path.split('/')
    return segments[segments.length - 1] || ''
  })

  return (
    <div class={style.root}>
      <div data-component="sidebar">
        <div data-slot="logo">
          <A href="/"><IconLogomark /></A>
        </div>

        <nav data-slot="nav">
          <ul>
            <li>
              <A href={`/${workspaceId()}`} activeClass="active">Dashboard</A>
            </li>
            <li>
              <A href={`/${workspaceId()}/integrations`} activeClass="active">
                Integrations
              </A>
            </li>
            <li>
              <A href={`/${workspaceId()}/billing`} activeClass="active">
                Billing
              </A>
            </li>
          </ul>
        </nav>

        <div data-slot="user">
          <Button
            color="ghost"
            onClick={() => auth.logout(auth.subject?.id!)}
            title={account.current?.email || ""}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div data-component="main-content">
        {props.children}
      </div>
    </div>
  )
}
