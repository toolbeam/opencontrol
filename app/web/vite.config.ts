import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import pages from "vite-plugin-pages"
import fs from "fs"
import { generateHydrationScript } from "solid-js/web"

export default defineConfig({
  plugins: [
    pages({
      exclude: ["**/~*", "**/components/*"],
    }),
    solidPlugin({ ssr: true }),
    // Add SSR middleware for development
    {
      name: "ssr-dev-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.endsWith(".html") || req.url === "/" || req.url === "") {
            let template = fs.readFileSync("./index.html", "utf-8")
            template = await server.transformIndexHtml(req.url, template)
            const { render } = await server.ssrLoadModule(
              "./src/entry-server.tsx",
            )
            const { app } = render()
            const html = template
              .replace("<!--ssr-outlet-->", app)
              .replace("<!--ssr-head-->", generateHydrationScript())
            res.setHeader("Content-Type", "text/html").end(html)
          } else {
            next()
          }
        })
      },
    },
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
})

