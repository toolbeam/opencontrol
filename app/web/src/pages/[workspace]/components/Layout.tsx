import style from "./layout.module.css"
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

  return (
    <div class={style.root}>
      <div data-component="sidebar">
        <div data-slot="logo">
          <A href="/"><IconLogomark /></A>
        </div>

        <nav data-slot="nav">
          <ul>
            <li>
              <A
                activeClass={style.navActiveLink}
                href={`/${workspaceId()}/integrations`}
              >
                Integrations
              </A>
            </li>
            <li>
              <A
                activeClass={style.navActiveLink}
                href={`/${workspaceId()}/billing`}
              >
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
      <div data-slot="main-content">
        {props.children}
      </div>
    </div>
  )
}
