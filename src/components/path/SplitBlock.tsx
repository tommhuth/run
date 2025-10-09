import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { memo, useMemo } from "react"

import Block from "./Block"

interface SplitBlockProps {
    position: Tuple3
    size: Tuple3
    gap: number
    fixed: boolean
}

function SplitBlock({
    position: [x, y, z],
    size: [width, height, depth],
    gap = 4,
    fixed,
}: SplitBlockProps) {
    const rotation = useMemo(() => random.float(-.4, .4), [])

    return [-1, 1].map(direction => {
        const partDepth = (depth - gap) / 2
        const offsetZ = partDepth / 2 + gap / 2
        const dx = Math.sin(rotation + Math.PI) * (direction * offsetZ)
        const dz = Math.cos(rotation + Math.PI) * (direction * offsetZ)
        const position: Tuple3 = [x + dx, y, z + dz]

        return (
            <Block
                key={direction}
                position={position}
                size={[width, height, partDepth]}
                rotation={rotation * (direction === 1 ? .75 : 1)}
                fixed={fixed}
            />
        )
    })
}

export default memo(SplitBlock)
