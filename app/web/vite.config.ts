import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import pages from "vite-plugin-pages"

export default defineConfig({
  plugins: [
    pages({
      exclude: ["**/~*", "**/components/*"],
    }),
    solidPlugin({ ssr: true }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
})
