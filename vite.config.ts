import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { compile } from "@tailwindcss/node";
import { readFile, readdir } from "node:fs/promises";

async function dashboardCandidates(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const candidates = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return dashboardCandidates(filename);
    if (!/\.(tsx?|css)$/.test(entry.name)) return [];
    return (await readFile(filename, "utf8")).split(/[\s"'`]+/);
  }));
  return candidates.flat();
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    {
      name: "isolated-marketing-theme",
      async load(id: string) {
        if (!id.endsWith("styles-source.tw?dashboard-theme")) return;
        const filename = id.split("?")[0];
        const directory = path.dirname(filename);
        this.addWatchFile(filename);
        const compiler = await compile(await readFile(filename, "utf8"), {
          base: directory,
          onDependency: (dependency) => this.addWatchFile(dependency),
        });
        const css = compiler.build(await dashboardCandidates(directory));
        return `export default ${JSON.stringify(css)}`;
      },
    } satisfies Plugin,
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        marketing: path.resolve(__dirname, "marketing-dashboard/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
