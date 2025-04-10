import { Match, Switch } from "solid-js"
import { useAccount } from "../components/context-account"
import { Navigate } from "@solidjs/router"
import { useOpenAuth } from "@openauthjs/solid"
import { IconLogo, ImageArchitecture } from "../ui/svg"
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
        <div class={styles.lander}>
          <div data-slot="hero">
            <section data-slot="top">
              <div data-slot="logo">
                <IconLogo />
              </div>
              <h1>Control your infrastructure with AI.</h1>
            </section>

            <section data-slot="cta">
              <div data-slot="col-1">
                <a href={`${import.meta.env.VITE_DOCS_URL}/docs/`}>Docs</a>
              </div>
              <div data-slot="col-2">
                <span onClick={() => auth.authorize()}>Try it</span>
              </div>
              <div data-slot="col-3">
                <a target="_blank" href="https://github.com/sst/opencontrol">
                  GitHub
                </a>
              </div>
            </section>

            <section data-slot="images">
              <div>
                <p>Architecture</p>
                <a href={`${import.meta.env.VITE_DOCS_URL}/docs/how-it-works/`}>
                  <ImageArchitecture width="100%" />
                </a>
              </div>
            </section>

            <section data-slot="content">
              <ul>
                <li>
                  <b>Self-hosted</b>: Runs in your infrastructure with access to
                  internal resources and functions from your codebase; deploys
                  to AWS Lambda, Cloudflare Workers, or containers.
                </li>
                <li>
                  <b>Unified gateway</b>: Generates a single HTTP endpoint that
                  you can chat with or register with your AI client and it
                  exposes all your tools.
                </li>
                <li>
                  <b>Universal</b>: Works with any model that supports tool
                  calling. Like the models from Anthropic, OpenAI, or Google.
                </li>
                <li>
                  <b>Secure</b>: Supports authentication through any OAuth
                  provider.
                </li>
              </ul>
            </section>

            <section data-slot="footer">
              <div data-slot="col-1">
                <span>Version: Beta</span>
              </div>
              <div data-slot="col-2">
                <span>
                  Author: <a href="https://sst.dev">SST</a>
                </span>
              </div>
            </section>
          </div>
        </div>
      </Match>
    </Switch>
  )
}
