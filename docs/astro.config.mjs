// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import mdx from "@astrojs/mdx"

export default defineConfig({
  // TODO: set to your published GitHub Pages URL once this docs site is
  // deployed (see docs/BRANDING.md - "Documentation site").
  site: "https://MIKE02jo.github.io",
  base: "/dreyhouse_player",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },
})
