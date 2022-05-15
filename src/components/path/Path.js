import { useThree } from "@react-three/fiber"
import { memo, useEffect } from "react"
import { generatePath, useStore } from "../../data/store"
import Plain from "./blocks/Plain"
import BlockType from "../../data/const/BlockType"

function Path() {
    let blocks = useStore(i => i.blocks)
    let { viewport } = useThree()

    useEffect(() => {
        let diagonal = Math.sqrt(viewport.width ** 2 + viewport.height ** 2)
        let forwardBuffer = diagonal * .5
        let backwardBuffer = diagonal * .75
        let idleId
        let intervalId
        let registerBuilder = () => {
            intervalId = setInterval(() => {
                idleId = requestIdleCallback(() => {
                    generatePath(forwardBuffer, backwardBuffer)
                }, { timeout: 250 })
            }, 500)
        }
        let onVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(intervalId)
                cancelIdleCallback(idleId)
            } else {
                registerBuilder()
            }
        }

        generatePath(forwardBuffer, backwardBuffer)
        registerBuilder()
        window.addEventListener("visibilitychange", onVisibilityChange)

        return () => {
            clearInterval(intervalId)
            cancelIdleCallback(idleId)
            window.removeEventListener("visibilitychange", onVisibilityChange)
        }
    }, [viewport])

    return (
        blocks.map(i => {
            switch (i.type) {
                case BlockType.PLAIN:
                    return <Plain {...i} key={i.id} />
                case BlockType.GAP:
                    return null
            }
        })
    )
}

export default memo(Path)