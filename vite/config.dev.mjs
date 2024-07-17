import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/

const url = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
    base: "./",
    build: {
        target: "esnext",
    },
    plugins: [
        vue(),
        //     {
        //     template: {
        //         compilerOptions: {
        //             isCustomElement: (tag) => ["DetailEvent"].includes(tag),
        //         },
        //     },
        // }
    ],
    resolve: {
        alias: {
            // "@public": fileURLToPath(new URL("./../public",
            //     import.meta.url)),
            "@": url("../src"),
            "@public": url("./../public"),
            "@components": url("./src/components"),
            "@views": url("./src/views"),
            "@router": url("./src/router"),
            "@utils": url("./src/utils"),
            "@services": url("./src/services"),
            "@styles": url("./src/styles"),
            "@interface": url("./src/interface"),
        },
    },
    server: {
        port: 8080,
    },
    optimizeDeps: {
        // include: ["@quais/contracts"],
        exclude: ["__vite-browser-external"],
    },
});

