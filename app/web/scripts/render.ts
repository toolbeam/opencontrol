import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { generateHydrationScript } from "solid-js/web"

// Get the directory name of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function generateStaticSite() {
  // Import the server entry point from the built files
  // @ts-expect-error
  const serverEntry = await import("../dist/server/entry-server.js")

  // Read the template HTML file
  const template = fs.readFileSync(
    path.resolve(__dirname, "../dist/client/index.html"),
    "utf-8",
  )

  // Render the app using the server entry
  const { app } = serverEntry.render()

  // Insert the rendered HTML into the template
  const html = template
    .replace("<!--ssr-outlet-->", app)
    .replace("<!--ssr-head-->", generateHydrationScript())

  // Create the output directory
  const outputDir = path.resolve(__dirname, "../dist/static")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Copy all assets from client build
  copyDir(
    path.resolve(__dirname, "../dist/client"),
    outputDir,
    (file) => file !== "index.html",
  )

  // Write the final HTML file
  fs.writeFileSync(path.resolve(outputDir, "index.html"), html)

  console.log("Static site generated in dist/static!")
}

// Helper function to copy directory contents
function copyDir(src, dest, filter = () => true) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, filter)
    } else if (filter(entry.name)) {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Run the function
generateStaticSite().catch(console.error)

