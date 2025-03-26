import style from "./index.module.css"
import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useDialog } from "../../ui/context-dialog"
import { DialogString } from "../../ui/dialog-string"
import { DialogSelect } from "../../ui/dialog-select"
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
      <div class={style.sidebar}>
        <div class={style.sidebarLogo}>
          <a href="/">
            <IconLogo />
          </a>
        </div>
        
        <nav class={style.sidebarNav}>
          <ul>
            <li>
              <a href="#">Integrations</a>
            </li>
            <li>
              <a href="#">Billing</a>
            </li>
          </ul>
        </nav>
        
        <div class={style.sidebarUser}>
          <div class={style.userInfo}>
            <div class={style.userName}>{currentUser?.name || "User"}</div>
            <div class={style.userEmail}>{currentUser?.email || ""}</div>
          </div>
          <button onClick={() => auth.logout()}>Logout</button>
        </div>
      </div>
      
      {/* Main Content */}
      <div class={style.content}>
        <section data-component-header>
          <h1>Users</h1>
        </section>

        <section data-component-content>
          <div data-component-stats>
            <div data-component-stat>
              <div data-component-stat-value>{users().length}</div>
              <div data-component-stat-label>Users</div>
            </div>
            <div data-component-stat>
              <div data-component-stat-value>{users()[0]?.workspace_id || "N/A"}</div>
              <div data-component-stat-label>Workspace ID</div>
            </div>
          </div>
          
          <ul data-component-user-list>
            {users().map(x => (
              <li data-component-user-item>
                <ul data-component-user-details onClick={() => {
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
        </section>
      </div>
    </div>
  )
}
