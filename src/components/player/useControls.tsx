import { useEffect, useMemo } from "react"


export function useControls() {
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])

    useEffect(() => {
        let onkeydown = (e: KeyboardEvent) => {
            keys[e.key] = true
        }
        let onkeyup = (e: KeyboardEvent) => {
            keys[e.key] = false
        }

        window.addEventListener("keydown", onkeydown)
        window.addEventListener("keyup", onkeyup)

        return () => {
            window.removeEventListener("keydown", onkeydown)
            window.removeEventListener("keyup", onkeyup)
        }
    }, [keys])

    return { keys }
}
