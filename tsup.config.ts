import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        // "src/pages/index.ts",
        "src/vite/index.ts",
        "src/index.tsx",
        "src/server.tsx",
        "src/client.tsx",
        // "src/placeholder-loader.tsx",
    ],
    external: [
        '~react-pages',
        "virtual:generated-pages",
        "virtual:reacticajs:servers",
        "virtual:reacticajs:server-hooks",
        "virtual:reacticajs:client-hooks",
        "virtual:reacticajs:common-hooks",
        "virtual:reacticajs:page-imports",
        "virtual:reacticajs:api-imports",
        "virtual:reacticajs:placeholder",
    ],
    outDir: "dist",
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    target: "esnext",
    shims: false,
});