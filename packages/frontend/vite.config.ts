import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  plugins: [solidPlugin(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    target: "esnext",
  },
})
