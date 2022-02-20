import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

async function run() {
    console.log("Building CLI");

    await esbuild
        .build({
            bundle: true,
            logLevel: "info",
            entryPoints: ["src/cli/bin.ts", "src/cli/index.ts"],
            outdir: "dist/cli",
            platform: "node",
            target: ["node12"],
            format: "cjs",
            plugins: [nodeExternalsPlugin()],
            watch: process.argv[2] === "--watch",
        })
        .catch(() => process.exit(1));

    await esbuild
        .build({
            bundle: true,
            logLevel: "info",
            entryPoints: ["src/bin/bin.ts", "src/bin/index.ts"],
            outdir: "dist/bin",
            platform: "node",
            target: ["node12"],
            format: "cjs",
            plugins: [nodeExternalsPlugin()],
            watch: process.argv[2] === "--watch",
        })
        .catch(() => process.exit(1));

    const nodeRuntimeExternals = [
        "$output/server.js",
        "$output/virtual_reactica_api-routes.js",
        "$output/virtual_reactica_page-routes.js",
        "$output/reactica-manifest.json",
        "$output/html-template.js",
        "$output/placeholder.js",
    ];

    function lateResolvePlugin() {
        return {
            name: "late-resolve",
            setup(build) {
                build.onResolve({ filter: /^\$output\// }, (args) => {
                    return {
                        path: "." + args.path.slice("$output".length),
                        external: true,
                    };
                });
            },
        };
    }

    console.log("Building Node dev runtime");
    await esbuild
        .build({
            bundle: true,
            logLevel: "info",
            entryPoints: ["src/bin/runtime/handle-node-request.ts"],
            outdir: "dist/bin/entries",
            platform: "node",
            target: ["node14"],
            format: "esm",
            external: [
                ...nodeRuntimeExternals,
                "react",
                "react-dom",
                "react-helmet-async",
            ],
            plugins: [lateResolvePlugin()],
            watch: process.argv[2] === "--watch",
        })
        .catch(() => process.exit(1));

    console.log("Building Node runtime");
    await esbuild
        .build({
            bundle: true,
            logLevel: "info",
            entryPoints: ["src/bin/runtime/entry-node.ts"],
            outdir: "dist/bin/entries",
            platform: "node",
            target: ["esnext"],
            format: "cjs",
            external: nodeRuntimeExternals,
            plugins: [lateResolvePlugin()],
            watch: process.argv[2] === "--watch",
        })
        .catch(() => process.exit(1));

    console.log("Building language detection client");
    await esbuild
        .build({
            bundle: true,
            logLevel: "info",
            entryPoints: ["src/bin/runtime/entry-language-detect.ts"],
            outdir: "dist/bin/entries",
            platform: "browser",
            target: ["esnext"],
            format: "cjs",
            plugins: [lateResolvePlugin()],
            watch: process.argv[2] === "--watch",
            minify: true,
        })
        .catch(() => process.exit(1));

    // console.log("Building Vercel runtime");
    // await esbuild
    //     .build({
    //         bundle: true,
    //         logLevel: "info",
    //         entryPoints: ["src/runtime/entry-vercel.ts"],
    //         outdir: "dist/entries",
    //         platform: "node",
    //         target: ["node12"],
    //         external: nodeRuntimeExternals,
    //         plugins: [lateResolvePlugin()],
    //         watch: process.argv[2] === "--watch",
    //     })
    //     .catch(() => process.exit(1));
    //
    // console.log("Building Netlify runtime");
    // await esbuild
    //     .build({
    //         bundle: true,
    //         logLevel: "info",
    //         entryPoints: ["src/runtime/entry-netlify.ts"],
    //         outdir: "dist/entries",
    //         platform: "node",
    //         target: ["node12"],
    //         external: nodeRuntimeExternals,
    //         plugins: [lateResolvePlugin()],
    //         watch: process.argv[2] === "--watch",
    //     })
    //     .catch(() => process.exit(1));
    //
    // console.log("Building Cloudflare Workers runtime");
    // await esbuild
    //     .build({
    //         bundle: true,
    //         logLevel: "info",
    //         entryPoints: ["src/runtime/entry-cloudflare-workers.ts"],
    //         outdir: "dist/entries",
    //         platform: "node",
    //         target: ["node12"],
    //         external: nodeRuntimeExternals,
    //         plugins: [lateResolvePlugin()],
    //         watch: process.argv[2] === "--watch",
    //     })
    //     .catch(() => process.exit(1));
}

run();