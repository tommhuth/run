import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"

interface UseFramerateReadyOptions {
    threshold?: number
    sampleSize?: number
    timeout?: number
}

export default function useFramerateReady(
    onReady: () => void,
    {
        threshold = .15,
        sampleSize = 40,
        timeout = 8_000,
    }: UseFramerateReadyOptions = {},
) {
    const samples = useRef<number[]>([])
    const fired = useRef(false)

    useEffect(() => {
        const tid = setTimeout(() => {
            if (!fired.current) {
                fired.current = true
                onReady()
            }
        }, timeout)

        return () => {
            fired.current = true
            clearTimeout(tid)
        }
    }, [timeout])

    useFrame((_, delta) => {
        if (fired.current) {
            return
        }

        samples.current.push(delta)

        if (samples.current.length > sampleSize) {
            samples.current.shift()
        }

        if (samples.current.length === sampleSize) {
            const avg = samples.current.reduce((a, b) => a + b, 0) / sampleSize
            // Average of squared differences from mean (spread of frame times)
            // large variance means frames are inconsistent
            const variance = samples.current.reduce((sum, d) => sum + (d - avg) ** 2, 0) / sampleSize
            // Coefficient of variation: normalizes spread relative to avg so threshold works at any framerate
            // A device running at 30fps has larger deltas than one at 60fps, but if both are consistent, 
            // their relative deviation will be similarly low.
            const relativeDeviation = Math.sqrt(variance) / avg

            if (relativeDeviation < threshold) {
                fired.current = true
                onReady()
            }
        }
    })
}
