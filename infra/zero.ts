import { readFileSync } from "fs"
import { auth, cluster, storage } from "./shared"
import { domain } from "./stage"
import { postgres } from "./postgres"

const conn = $interpolate`postgresql://${postgres.username}:${postgres.password}@${postgres.host}/${postgres.database}`

const tag = $dev
  ? `latest`
  : JSON.parse(
      readFileSync("./node_modules/@rocicorp/zero/package.json").toString(),
    ).version.replace("+", "-")
const image = `registry.hub.docker.com/rocicorp/zero:${tag}`

const zeroEnv = {
  NO_COLOR: "1",
  FORCE: "1",
  ZERO_LOG_LEVEL: "info",
  ZERO_LITESTREAM_LOG_LEVEL: "info",
  ZERO_UPSTREAM_DB: conn,
  ZERO_CVR_DB: conn,
  ZERO_CHANGE_DB: conn,
  ZERO_REPLICA_FILE: `/tmp/${$app.stage}.db`,
  ZERO_LITESTREAM_RESTORE_PARALLELISM: "64",
  ZERO_APP_ID: $app.stage,
  ZERO_AUTH_JWKS_URL: $interpolate`${auth.properties.url}/.well-known/jwks.json`,
  ...($dev
    ? {}
    : {
        ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${storage.name}/zero/10`,
      }),
}

const replication = !$dev
  ? new sst.aws.Service(`ZeroReplication`, {
      cluster,
      ...($app.stage === "production"
        ? {
            cpu: "2 vCPU",
            memory: "4 GB",
          }
        : {}),
      image,
      wait: true,
      link: [postgres, storage],
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      loadBalancer: {
        rules: [
          {
            listen: "80/http",
            forward: "4849/http",
          },
        ],
        public: false,
      },
      environment: {
        ...zeroEnv,
        ZERO_CHANGE_MAX_CONNS: "3",
        ZERO_NUM_SYNC_WORKERS: "0",
      },
      logging: {
        retention: "1 month",
      },
      transform: {
        service: {
          healthCheckGracePeriodSeconds: 900,
        },
        taskDefinition: {
          ephemeralStorage: {
            sizeInGib: 200,
          },
        },
        loadBalancer: {
          idleTimeout: 60 * 60,
        },
      },
    })
  : undefined

if (replication)
  new command.local.Command(
    "ZeroPermission",
    {
      dir: process.cwd() + "/app/zero",
      environment: {
        ZERO_UPSTREAM_DB: zeroEnv.ZERO_UPSTREAM_DB,
        ZERO_APP_ID: zeroEnv.ZERO_APP_ID,
      },
      create: "bun run zero-deploy-permissions",
      triggers: [Date.now()],
    },
    {
      dependsOn: [replication],
    },
  )

export const zero = new sst.aws.Service("Zero", {
  cluster,
  image,
  link: [postgres, storage],
  ...($app.stage === "production"
    ? {
        cpu: "2 vCPU",
        memory: "4 GB",
      }
    : {}),
  environment: {
    ...zeroEnv,
    ...($dev
      ? {
          ZERO_NUM_SYNC_WORKERS: "1",
        }
      : {
          ZERO_CHANGE_STREAMER_URI: replication!.url.apply((val) =>
            val.replace("http://", "ws://"),
          ),
          ZERO_UPSTREAM_MAX_CONNS: "15",
          ZERO_CVR_MAX_CONNS: "160",
        }),
  },
  wait: true,
  health: {
    command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
    interval: "5 seconds",
    retries: 3,
    startPeriod: "300 seconds",
  },
  loadBalancer: {
    domain: {
      name: "zero." + domain,
      dns: sst.cloudflare.dns({
        zone: "2eeb3aac61ad26f10be95c5365bd8b89",
      }),
    },
    rules: [
      { listen: "443/https", forward: "4848/http" },
      { listen: "80/http", forward: "4848/http" },
    ],
  },
  scaling: {
    min: 1,
    max: 4,
  },
  transform: {
    service: {
      healthCheckGracePeriodSeconds: 900,
    },
    taskDefinition: {
      ephemeralStorage: {
        sizeInGib: 200,
      },
    },
    loadBalancer: {
      idleTimeout: 60 * 60,
    },
  },
  dev: {
    command: "bun dev",
    directory: "app/zero",
    url: "http://localhost:4848",
  },
})
