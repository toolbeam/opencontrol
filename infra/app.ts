import { templateUrl } from "./connect"
import { postgres } from "./postgres"
import { auth, router } from "./shared"
import { domain } from "./stage"
import { zero } from "./zero"

export const secret = {
  AnthropicApiKey: new sst.Secret("AnthropicApiKey"),
}
const AllSecrets = Object.values(secret)

const opencontrol = new sst.aws.OpenControl("OpenControl", {
  server: {
    handler: "app/function/src/opencontrol.handler",
    link: [...AllSecrets, postgres],
    policies: ["arn:aws:iam::aws:policy/ReadOnlyAccess"],
  },
})
router.route("opencontrol-" + domain, opencontrol.url)

export const api = new sst.aws.Function("Api", {
  handler: "app/function/src/api.handler",
  link: [auth, postgres, ...AllSecrets],
  permissions: [{ actions: ["sts:*"], resources: ["*"] }],
  url: true,
})
router.route("api-" + domain, api.url)

const site = new sst.aws.StaticSite("Web", {
  cdn: false,
  build: {
    command: "bun run build",
    output: "dist/client",
  },
  environment: {
    VITE_API_URL: `https://api-` + domain,
    VITE_AUTH_URL: auth.properties.url,
    VITE_ZERO_URL: zero.url,
    VITE_TEMPLATE_URL: templateUrl,
  },
  path: "app/web",
})
router.routeSite(domain, site)
