import { ROAD_FORWARD_EDGE } from "@components/road/const"
import { createRoot, RenderProps } from "@react-three/fiber"
import { lazy, ReactNode } from "react"
import { createRoot as createUiRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"

import Ui from "./ui/Ui"

function getConfiguration() {
    return {
        camera: {
            near: .01,
            far: ROAD_FORWARD_EDGE * 6 + 200,
            position: [0, 20, 0],
            rotation: [0, Math.PI * .75, 0],
            fov: 70
        },
        flat: false,
        shadows: "variance",
        dpr: Math.max(Math.pow(window.devicePixelRatio, 0.65), 1),
        size: {
            width: window.innerWidth,
            height: window.innerHeight,
            top: 0,
            left: 0
        },
        gl: {
            antialias: true,
            depth: true,
            stencil: false,
            alpha: false,
            powerPreference: "high-performance",
        },
    } satisfies RenderProps<HTMLCanvasElement>
}

async function configure(element: ReactNode) {
    await canvasRoot.configure(getConfiguration())

    canvasRoot.render(element)
}

const canvasRoot = createRoot(document.getElementById("canvas") as HTMLCanvasElement)
const uiRoot = createUiRoot(document.getElementById("ui") as HTMLDivElement)
const App = lazy(() => import("./App"))

configure(<App />)
uiRoot.render(<Ui />)

window.addEventListener("resize", () => {
    canvasRoot.configure(getConfiguration())
})

const updateSW = registerSW({
    onNeedRefresh() {
        console.info("New services worker ready")
        updateSW(true)
    },
    onOfflineReady() {
        console.info("Ready to work offline")
    },
}) 
