/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "opencontrol",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
          profile: input.stage === "production" ? "sst-production" : "sst-dev",
        },
        planetscale: "0.2.2",
        command: "1.0.2",
        random: "4.17.0",
      },
    }
  },
  async run() {
    await import("./infra/app")
  },
})
