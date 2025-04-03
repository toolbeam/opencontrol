import style from "./index.module.css"
import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useDialog } from "../../ui/context-dialog"
import { Button } from "../../ui/button"
import { IconLogo } from "../../ui/svg"
import { IconArrowRight } from "../../ui/svg/icons"
import { useAccount } from "../../components/context-account"
import { useOpenAuth } from "@openauthjs/solid"
import { onMount } from "solid-js"

export default function Index() {
  const zero = useZero()
  const auth = useOpenAuth()
  const account = useAccount()
  const [users] = useQuery(() => zero.query.user.related("workspace").orderBy("time_seen", "desc"))
  const dialog = useDialog()

  // Current user from account
  const currentUser = account.current

  // // Call markMessagesBeforeTools on mount
  // onMount(() => {
  //   markMessagesBeforeTools();
  // })

  // Handle expanding/collapsing tool messages
  const toggleToolExpansion = (event) => {
    const toolElement = event.currentTarget.closest('[data-component="tool"]');
    const isExpanded = toolElement.getAttribute('data-expanded') === 'true';

    // Toggle current tool
    toolElement.setAttribute('data-expanded', String(!isExpanded));

    // Update the expand/collapse symbol
    const expandSymbol = toolElement.querySelector('[data-slot="expand"]');
    if (expandSymbol) {
      expandSymbol.textContent = !isExpanded ? '−' : '+';
    }
  }
  //
  // // Function to mark messages followed by tool calls
  // const markMessagesBeforeTools = () => {
  //   const messages = document.querySelectorAll('[data-component="message"]');
  //   for (let i = 0; i < messages.length - 1; i++) {
  //     const current = messages[i];
  //     const next = messages[i + 1];
  //
  //     // Mark AI messages followed by tool calls
  //     if (current.hasAttribute('data-assistant') && next.hasAttribute('data-tool')) {
  //       current.setAttribute('data-followed-by-tool', 'true');
  //     }
  //
  //     // Mark tool messages followed by another tool call
  //     if (current.hasAttribute('data-tool') && next.hasAttribute('data-tool')) {
  //       current.setAttribute('data-followed-by-tool', 'true');
  //     }
  //   }
  // }

  return (
    <div class={style.root}>
      {/* Sidebar */}
      <div data-component="sidebar">
        <div data-slot="logo">
          <a href="/">
            <IconLogo />
          </a>
        </div>

        <nav data-slot="nav">
          <ul>
            <li>
              <a href="#">Integrations</a>
            </li>
            <li>
              <a href="#">Billing</a>
            </li>
          </ul>
        </nav>

        <div data-component="user">
          <div data-slot="info">
            <div data-slot="email">{currentUser?.email || ""}</div>
          </div>
          <Button color="secondary" onClick={() => auth.logout()}>Logout</Button>
        </div>
      </div>

      {/* Main Content */}
      <div data-component="main-content">
        <div data-slot="messages">
          <div data-component="message" data-user="">Can you look up how many users are in the `zinq` workspace?</div>
          <div data-component="message" data-assistant="">I'll check that for you.</div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              SELECT * FROM users WHERE workspace_id = 'zinq';
              No results found.
            </div>
          </div>

          <div data-component="message" data-assistant="">Let me try a different approach to find this information.</div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              SHOW TABLES;
              Tables: users, workspaces, user_workspace
            </div>
          </div>

          <div data-component="message" data-assistant="">Now I'll check for users in the zinq workspace:</div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              SELECT * FROM user_workspace WHERE workspace_name = 'zinq';
              Error: column 'workspace_name' does not exist
            </div>
          </div>

          <div data-component="message" data-assistant="">Let me check the structure of the tables to determine the correct column names:</div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              DESCRIBE workspaces;
              id: uuid
              slug: varchar
              created_at: timestamp
              updated_at: timestamp
            </div>
          </div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              DESCRIBE user_workspace;
              user_id: uuid
              workspace_id: uuid
              role: varchar
              joined_at: timestamp
            </div>
          </div>

          <div data-component="message" data-assistant="">I see that the workspace table doesn't have a "name" column, but has a "slug" column instead. Let me try the query again:</div>

          <div data-component="tool" data-expanded="false">
            <div data-slot="header" onClick={toggleToolExpansion}>
              <span data-slot="name">database_query_readonly</span>
              <span data-slot="expand">+</span>
            </div>
            <div data-slot="content">
              SELECT COUNT(*) FROM user_workspace
              JOIN workspaces ON user_workspace.workspace_id = workspaces.id
              WHERE workspaces.slug = 'zinq';

              Count: 2
            </div>
          </div>

          <div data-component="message" data-assistant="">2 users in the zinq workspace.</div>
          <div data-component="loading">
            <span>■</span><span>■</span><span>■</span>
          </div>
          <div data-component="clear">
            <Button size="sm" color="ghost">Clear chat</Button>
          </div>
        </div>

        <div data-slot="footer">
          <div data-component="chat">
            <textarea
              autofocus
              placeholder="How can I help?"
              onInput={(e) => {
                const input = e.currentTarget;
                const sendButton = input.nextElementSibling as HTMLButtonElement;
                if (sendButton) {
                  sendButton.disabled = !e.target.value.trim();
                }

                // Auto-grow
                e.target.style.height = "3.6875rem";
                const scrollHeight = input.scrollHeight;
                e.target.style.height = `${scrollHeight}px`;
              }} />
            <Button
              disabled
              color="ghost"
              icon={<IconArrowRight />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
