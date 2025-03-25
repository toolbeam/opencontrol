export const isPermanentStage = ["production", "dev"].includes($app.stage)

export const domain = (() => {
  if ($app.stage === "production") return "opencontrol.ai"
  if ($app.stage === "dev") return "dev.opencontrol.ai"
  return `${$app.stage}.dev.opencontrol.ai`
})()
