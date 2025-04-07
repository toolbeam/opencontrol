import style from "./layout.module.css"
import { useOpenAuth } from "@openauthjs/solid"
import { useAccount } from "../../../components/context-account"
import { Button } from "../../../ui/button"
import { IconLogomark } from "../../../ui/svg"
import { IconBars3BottomLeft } from "../../../ui/svg/icons"
import { ParentProps, createMemo, createSignal } from "solid-js"
import { A } from "@solidjs/router"

export default function Layout(props: ParentProps) {
  const auth = useOpenAuth()
  const account = useAccount()
  const [sidebarOpen, setSidebarOpen] = createSignal(false)

  const workspaceId = createMemo(() => account.current?.workspaces[0].id)

  return (
    <div class={style.root}>
      {/* Mobile top bar */}
      <div data-component="mobile-top-bar">
        <button
          data-slot="toggle"
          onClick={() => setSidebarOpen(!sidebarOpen())}
        >
          <IconBars3BottomLeft />
        </button>

        <div data-slot="mobile-logo">
          <A href="/">
            <IconLogomark />
          </A>
        </div>
      </div>

      {/* Backdrop for mobile sidebar - closes sidebar when clicked */}
      {sidebarOpen() && (
        <div data-component="backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div data-component="sidebar" data-opened={sidebarOpen() ? "true" : "false"}>
        <div data-slot="logo">
          <A href="/"><IconLogomark /></A>
        </div>

        <nav data-slot="nav">
          <ul>
            <li>
              <A
                end
                activeClass={style.navActiveLink}
                href={`/${workspaceId()}`}
                onClick={() => setSidebarOpen(false)}
              >
                Home
              </A>
            </li>
            <li>
              <A
                activeClass={style.navActiveLink}
                href={`/${workspaceId()}/integrations`}
                onClick={() => setSidebarOpen(false)}
              >
                Integrations
              </A>
            </li>
            <li>
              <A
                activeClass={style.navActiveLink}
                href={`/${workspaceId()}/billing`}
                onClick={() => setSidebarOpen(false)}
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
