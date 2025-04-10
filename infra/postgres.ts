import { vpc } from "./shared"
import { isPermanentStage } from "./stage"

export const postgres = new sst.aws.Aurora("Postgres", {
  vpc,
  engine: "postgres",
  scaling: isPermanentStage
    ? undefined
    : {
        min: "0 ACU",
        max: "1 ACU",
      },
  transform: {
    clusterParameterGroup: {
      parameters: [
        {
          name: "rds.logical_replication",
          value: "1",
          applyMethod: "pending-reboot",
        },
        {
          name: "max_slot_wal_keep_size",
          value: "10240",
          applyMethod: "pending-reboot",
        },
      ],
    },
  },
})

new sst.x.DevCommand("Studio", {
  link: [postgres],
  dev: {
    command: "bun db studio",
    directory: "app/core",
    autostart: true,
  },
})

const migrator = new sst.aws.Function("DatabaseMigrator", {
  handler: "app/function/src/migrator.handler",
  link: [postgres],
  vpc,
  copyFiles: [
    {
      from: "app/core/migrations",
      to: "./migrations",
    },
  ],
})

export const migration = $dev
  ? new aws.lambda.Invocation("DatabaseMigratorInvocation", {
      input: Date.now().toString(),
      functionName: migrator.name,
    })
  : undefined
