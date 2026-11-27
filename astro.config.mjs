// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://cashpilot.club",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  devToolbar: { enabled: false },
});
