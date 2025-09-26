import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import glsl from "vite-plugin-glsl"
import react from "@vitejs/plugin-react-swc"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    assetsInclude: ["**/*.glb"],
    resolve: {
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@data": path.resolve(__dirname, "src/data"),
            "@assets": path.resolve(__dirname, "assets"),
            "@src": path.resolve(__dirname, "src"),
        },
    },
    plugins: [
        react(),
        glsl(),
        VitePWA({
            registerType: "prompt",
            workbox: {
                globPatterns: ["**/*.{html,js,css,png,svg,woff,woff2,glb}"]
            },
            manifest: {
                name: "R3F Boilerplate",
                short_name: "R3F Boilerplate",
                display: "fullscreen",
                description: "R3F Boilerplate",
                orientation: "portrait",
                theme_color: "#000000",
                icons: [
                    {
                        "src": "/assets/icons/pwa-icon.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "any maskable"
                    },
                ]
            }
        })
    ],
})