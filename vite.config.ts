import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { compile } from "@tailwindcss/node";
import { readFile, readdir } from "node:fs/promises";

type DashboardScan = { candidates: string[]; files: string[] };

async function dashboardCandidates(directory: string): Promise<DashboardScan> {
  const entries = await readdir(directory, { withFileTypes: true });
  const scans = await Promise.all(entries.map(async (entry): Promise<DashboardScan> => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return dashboardCandidates(filename);
    if (!/\.(tsx?|css)$/.test(entry.name)) return { candidates: [], files: [] };
    const text = await readFile(filename, "utf8");
    return { candidates: text.split(/[\s"'`]+/), files: [filename] };
  }));
  return scans.reduce<DashboardScan>(
    (acc, scan) => ({ candidates: acc.candidates.concat(scan.candidates), files: acc.files.concat(scan.files) }),
    { candidates: [], files: [] },
  );
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
        const { candidates, files } = await dashboardCandidates(directory);
        // Every dashboard source file can contribute class candidates, so each one must
        // invalidate the compiled theme; otherwise new utilities silently never appear.
        for (const file of files) this.addWatchFile(file);
        const css = compiler.build(candidates);
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
