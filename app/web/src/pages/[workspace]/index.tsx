import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useDialog } from "../../ui/context-dialog"
import { DialogString } from "../../ui/dialog-string"
import { DialogSelect } from "../../ui/dialog-select"

export default function Index() {
  const zero = useZero()
  const [users] = useQuery(() => zero.query.user.orderBy("time_seen", "desc"))
  const dialog = useDialog()

  return (
    <div>
      <h1>Users</h1>
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
  )
}
