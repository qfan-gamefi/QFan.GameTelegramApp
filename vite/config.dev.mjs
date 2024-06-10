import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
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
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        port: 8080,
    },
});
