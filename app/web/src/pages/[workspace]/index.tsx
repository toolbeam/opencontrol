import style from "./index.module.css"
import { useQuery } from "@rocicorp/zero/solid"
import { useZero } from "../components/context-zero"
import { useDialog } from "../../ui/context-dialog"
import { DialogString } from "../../ui/dialog-string"
import { DialogSelect } from "../../ui/dialog-select"
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
  
  // Call markMessagesBeforeTools on mount
  onMount(() => {
    markMessagesBeforeTools();
  })

  // Handle expanding/collapsing tool messages
  const toggleToolExpansion = (event) => {
    const toolElement = event.currentTarget.closest('[data-slot="message"]');
    const isExpanded = toolElement.getAttribute('data-tool-expanded') === 'true';

    // Toggle current tool
    toolElement.setAttribute('data-tool-expanded', String(!isExpanded));

    // Update the expand/collapse symbol
    const expandSymbol = toolElement.querySelector('[data-slot="tool-expand"]');
    if (expandSymbol) {
      expandSymbol.textContent = !isExpanded ? '−' : '+';
    }
  }

  // Function to mark messages followed by tool calls
  const markMessagesBeforeTools = () => {
    const messages = document.querySelectorAll('[data-slot="message"]');
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      // Mark AI messages followed by tool calls
      if (current.hasAttribute('data-assistant') && next.hasAttribute('data-tool')) {
        current.setAttribute('data-followed-by-tool', 'true');
      }
      
      // Mark tool messages followed by another tool call
      if (current.hasAttribute('data-tool') && next.hasAttribute('data-tool')) {
        current.setAttribute('data-followed-by-tool', 'true');
      }
    }
  }

  return (
    <div class={style.root}>
      {/* Sidebar */}
      <div data-component="sidebar">
        <div data-component="sidebar-logo">
          <a href="/">
            <IconLogo />
          </a>
        </div>

        <nav data-component="sidebar-nav">
          <ul>
            <li>
              <a href="#">Integrations</a>
            </li>
            <li>
              <a href="#">Billing</a>
            </li>
          </ul>
        </nav>

        <div data-component="sidebar-user">
          <div data-component="user-info">
            <div data-component="user-email">{currentUser?.email || ""}</div>
          </div>
          <Button color="primary" onClick={() => auth.logout()}>Logout</Button>
        </div>
      </div>

      {/* Main Content */}
      <div data-component="main-content">
        <div data-component="messages">
          <div data-slot="message" data-user="">Can you look up how many users are in the `zinq` workspace?</div>
          <div data-slot="message" data-assistant="">I'll check that for you.</div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">SELECT * FROM users WHERE workspace_id = 'zinq';
No results found.</div>
            </div>
          </div>

          <div data-slot="message" data-assistant="">Let me try a different approach to find this information.</div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">SHOW TABLES;
Tables: users, workspaces, user_workspace</div>
            </div>
          </div>

          <div data-slot="message" data-assistant="">Now I'll check for users in the zinq workspace:</div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">SELECT * FROM user_workspace WHERE workspace_name = 'zinq';
Error: column 'workspace_name' does not exist</div>
            </div>
          </div>

          <div data-slot="message" data-assistant="">Let me check the structure of the tables to determine the correct column names:</div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">DESCRIBE workspaces;
id: uuid
slug: varchar
created_at: timestamp
updated_at: timestamp</div>
            </div>
          </div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">DESCRIBE user_workspace;
user_id: uuid
workspace_id: uuid
role: varchar
joined_at: timestamp</div>
            </div>
          </div>

          <div data-slot="message" data-assistant="">I see that the workspace table doesn't have a "name" column, but has a "slug" column instead. Let me try the query again:</div>

          <div data-slot="message" data-tool="" data-tool-expanded="false">
            <div data-slot="tool-header" onClick={toggleToolExpansion}>
              <span data-slot="tool-prefix">TOOL:</span>
              <span data-slot="tool-name">database_query_readonly</span>
              <span data-slot="tool-expand">+</span>
            </div>
            <div data-slot="tool-content">
              <div data-slot="tool-output">SELECT COUNT(*) FROM user_workspace
JOIN workspaces ON user_workspace.workspace_id = workspaces.id
WHERE workspaces.slug = 'zinq';

Count: 2</div>
            </div>
          </div>

          <div data-slot="message" data-assistant="">2 users in the zinq workspace.</div>
          <div data-slot="message" data-clear="">Clear chat</div>
          <div data-slot="spacer" style="border-bottom: none;"></div>
        </div>

        <div data-component="footer">
          <div data-slot="chat">
            <textarea 
              autofocus 
              data-component="input" 
              placeholder="Type your command here"
              onInput={(e) => {
                const sendButton = document.querySelector('[data-component="send-button"]');
                if (sendButton) {
                  sendButton.disabled = !e.target.value.trim();
                }
              }}></textarea>
            <button 
              data-component="send-button" 
              disabled={true}
              onClick={() => {
                const input = document.querySelector('[data-component="input"]');
                if (input && input.value.trim()) {
                  // Process input here
                  console.log('Send message:', input.value);
                  input.value = '';
                  document.querySelector('[data-component="send-button"]').disabled = true;
                }
              }}>
              <IconArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
