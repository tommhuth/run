import { useStore } from "@data/store/store"
import { useFrame, useThree, Viewport } from "@react-three/fiber"
import { metrics, setContext } from "@sentry/browser"
import { useEffect, useRef } from "react"
import { WebGLRenderer } from "three"

export function getStats(gl: WebGLRenderer, viewport: Viewport) {
    const context = gl.getContext()
    const extension = context.getExtension("WEBGL_debug_renderer_info")
    let gpu = "Unknown"

    if (extension) {
        gpu = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
    }

    return {
        gpu,
        width: Math.ceil(window.innerWidth * viewport.dpr),
        height: Math.ceil(window.innerHeight * viewport.dpr),
        dpr: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        renderDpr: viewport.dpr
    }
}

export function useRenderStats() {
    const deltas = useRef<number[]>([])
    const time = useRef(0)
    const { gl, viewport } = useThree()
    const loading = useStore(i => i.loading)

    useEffect(() => {
        if (loading) {
            return
        }

        const attributes = getStats(gl, viewport)

        setContext("device", attributes)
        metrics.count("device", 1, { attributes })
    }, [loading])

    useFrame((state, delta) => {
        const nd = delta * 1000
        const logInterval = 15_000

        if (nd > 1_000) {
            return
        }

        deltas.current.push(nd)
        time.current += nd

        if (time.current > logInterval) {
            const average = deltas.current.reduce((prev, curr) => prev + curr, 0) / deltas.current.length
            const high = Math.max(...deltas.current)
            const attributes = getStats(gl, viewport)

            metrics.distribution("delta_average", average, {
                unit: "millisecond",
                attributes,
            })
            metrics.distribution("delta_high", high, {
                unit: "millisecond",
                attributes,
            })

            deltas.current = []
            time.current = 0
        }
    })
}
