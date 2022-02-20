import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/vite/index.ts",
        "src/index.tsx",
        "src/server.tsx",
        "src/client.tsx",
        "src/placeholder-loader.tsx",
    ],
    external: [
        "virtual:reacticajs:server-hooks",
        "virtual:reacticajs:client-hooks",
        "virtual:reacticajs:common-hooks",
        "virtual:reacticajs:page-imports",
        "virtual:reacticajs:api-imports",
        "virtual:reacticajs:placeholder",
    ],
    outDir: "lib",
    format: ["esm"],
    dts: true,
    clean: true,
    target: "esnext",
    shims: false,
});