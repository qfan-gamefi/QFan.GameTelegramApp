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
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@public": url("./../public"),
            "@components": fileURLToPath(
                new URL("./src/components", import.meta.url)
            ),
            "@views/*": ["src/views/*"],
            "@router/*": ["src/router/*"],
            "@utils/*": ["src/utils/*"],
            "@services/*": ["src/services/*"],
            "@styles/*": ["src/styles/*"],
            "@interface/*": ["src/interface/*"],
        },
    },
    logLevel: "warning",
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ["phaser"],
                },
            },
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
});
