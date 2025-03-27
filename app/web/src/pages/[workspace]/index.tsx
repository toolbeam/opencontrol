import style from "./index.module.css"
import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useDialog } from "../../ui/context-dialog"
import { DialogString } from "../../ui/dialog-string"
import { DialogSelect } from "../../ui/dialog-select"
import { Button } from "../../ui/button"
import { IconLogo } from "../../ui/svg"
import { useAccount } from "../../components/context-account"
import { useOpenAuth } from "@openauthjs/solid"

export default function Index() {
  const zero = useZero()
  const auth = useOpenAuth()
  const account = useAccount()
  const [users] = useQuery(() => zero.query.user.related("workspace").orderBy("time_seen", "desc"))
  const dialog = useDialog()

  // Current user from account
  const currentUser = account.current

  return (
    <div class={style.root}>
      {/* Sidebar */}
      <div data-component-sidebar>
        <div data-component-sidebar-logo>
          <a href="/">
            <IconLogo />
          </a>
        </div>

        <nav data-component-sidebar-nav>
          <ul>
            <li>
              <a href="#">Integrations</a>
            </li>
            <li>
              <a href="#">Billing</a>
            </li>
          </ul>
        </nav>

        <div data-component-sidebar-user>
          <div data-component-user-info>
            <div data-component-user-email>{currentUser?.email || ""}</div>
          </div>
          <Button color="primary" onClick={() => auth.logout()}>Logout</Button>
        </div>
      </div>

      {/* Main Content */}
      <div data-component-main-content>
        <div>
          <div>
            <div>{users().length}</div>
            <div>Users</div>
          </div>
          <div>
            <div>{users()[0]?.workspace_id || "N/A"}</div>
            <div>Workspace ID</div>
          </div>
        </div>

        <ul>
          {users().map(x => (
            <li>
              <ul onClick={() => {
                dialog.open(DialogSelect, {
                  placeholder: "Select",
                  title: "Edit user",
                  options: [
                    {
                      display: "Change name",
                      onSelect: () => {
                        dialog.open(DialogString, {
                          title: "Enter a name",
                          action: "Change name",
                          placeholder: "Enter a name",
                          onSubmit: (value) => {
                            zero.mutate.user.update({
                              id: x.id,
                              workspace_id: x.workspace_id,
                              name: value,
                            })
                          }
                        })
                      }
                    },
                    {
                      display: "Remove user",
                      onSelect: () => {
                        dialog.close()
                      }
                    }
                  ],
                })
              }}>
                <li>{x.id}</li>
                <li>{x.email}</li>
                <li>{x.name || "No name"}</li>
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
