import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./src/server.ts" },
    }),
    viteReact(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  server: { port: 3000 },
});

// --- If you'd rather run on a plain Node server (no Cloudflare): ---
// Remove the `cloudflare(...)` plugin above and change target to "node-server":
//   tanstackStart({ target: "node-server", server: { entry: "./src/server.ts" } }),
// Also delete wrangler.jsonc and the @cloudflare/vite-plugin dependency.
