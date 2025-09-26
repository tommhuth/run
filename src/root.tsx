import { createRoot as createUiRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { lazy, ReactNode } from "react"
import { createRoot, RenderProps } from "@react-three/fiber"
import Ui from "./ui/Ui"
import { clamp } from "@data/utils"

function getConfiguration() {
    return {
        camera: {
            //  zoom: 1,
            near: .01,
            far: 150,
            position: [0, 0, 0],
        },
        flat: true,
        //orthographic: false,
        shadows: true,
        dpr: clamp(window.devicePixelRatio * .75, 1, 2),
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

let updateSW = registerSW({
    onNeedRefresh() {
        console.info("New services worker ready")
        updateSW(true)
    },
    onOfflineReady() {
        console.info("Ready to work offline")
    },
}) 