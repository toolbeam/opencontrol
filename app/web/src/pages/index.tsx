import { Match, Switch } from "solid-js";
import { useAccount } from "../components/context-account";
import { Navigate } from "@solidjs/router";
import { useOpenAuth } from "@openauthjs/solid"
import { IconLogo, ImageArchitecture } from "../ui/svg"
import screenshot from "../assets/screenshot.png"
import styles from "./lander.module.css"

export default function Index() {
  const auth = useOpenAuth()
  const account = useAccount()
  return (
    <Switch>
      <Match when={account.current}>
        <Navigate href={`/${account.current!.workspaces[0].id}`} />
      </Match>
      <Match when={!account.current}>
        <div class={styles.hero}>
          <section data-component-top>
            <div data-component-logo>
              <IconLogo />
            </div>
            <h1>Control your infrastructure with AI.</h1>
          </section>

          <section data-component-cta>
            <div data-component-col="1">
              <a href="/docs/how-it-works/">Learn more</a>
            </div>
            <div data-component-col="2">
              <span onClick={() => auth.authorize()}>Get started</span>
            </div>
            <div data-component-col="3">
              <a target="_blank" href="https://github.com/toolbeam/opencontrol">Star on GitHub</a>
            </div>
          </section>

          <section data-component-images>
            <div>
              <p>Client</p>
              <a href="/docs/usage/">
                <img src={screenshot} alt="OpenControl screenshot" />
              </a>
            </div>
            <div>
              <p>Architecture</p>
              <a href="/docs/how-it-works/">
                <ImageArchitecture width="100%" />
              </a>
            </div>
          </section>

          <section data-component-content>
            <ul>
              <li><b>Self-hosted</b>: Runs in your infrastructure with access to internal resources and functions from your codebase; deploys to AWS Lambda, Cloudflare Workers, or containers.</li>
              <li><b>Unified gateway</b>: Generates a single HTTP endpoint that you can chat with or register with your AI client and it exposes all your tools.</li>
              <li><b>Universal</b>: Works with any model that supports tool calling. Like the models from Anthropic, OpenAI, or Google.</li>
              <li><b>Secure</b>: Supports authentication through any OAuth provider.</li>
            </ul>
          </section>

          <section data-component-footer>
            <div data-component-col="1">
              <span>Version: Beta</span>
            </div>
            <div data-component-col="2">
              <span>Author: <a href="https://sst.dev">SST</a></span>
            </div>
          </section>
        </div>
      </Match>
    </Switch>
  )
}
