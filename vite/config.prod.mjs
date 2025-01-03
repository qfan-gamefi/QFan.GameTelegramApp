import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const phasermsg = () => {
    return {
        name: "phasermsg",
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);

            process.stdout.write(`✨ Done ✨\n`);
        },
    };
};

const url = (path) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
    base: "./",
    plugins: [vue(), phasermsg()],
    css: {
        postcss: './postcss.config.js',
    },
    resolve: {
        alias: {
            "@": url("../src"),
            "@public": url("./../public"),
            "@components": url("./src/components"),
            "@views": url("./src/views"),
            "@router": url("./src/router"),
            "@utils": url("./src/utils"),
            "@services": url("./src/services"),
            "@styles": url("./src/styles"),
            "@interface": url("./src/interface"),
            "@config": ["./src/config"]
            // "readable-stream": "vite-compatible-readable-stream",
        },
    },
    logLevel: "warning",
    build: {
        target: "esnext",
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ["phaser"],
                },
            },
            // external: ["crypto-js"],
        },
        minify: "terser",
        terserOptions: {
            compress: {
                passes: 2,
            },
            mangle: true,
            format: {
                comments: false,
            },
        },
    },
    optimizeDeps: {
        // include: ["@quais/contracts"],
        exclude: ["__vite-browser-external"],
    },
});

