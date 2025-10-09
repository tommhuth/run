import { removePathSection } from "@data/store/actions"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { memo } from "react"

import Block from "./Block"
import SplitBlock from "./SplitBlock"

interface PathSectionProps {
    id: string
    size: Tuple3
    position: Tuple3
    ready?: boolean
    fixed?: boolean
    gap: boolean
}

function PathSection({
    fixed = false,
    id,
    size: [width, height, depth],
    position: [x, y, z],
    gap
}: PathSectionProps) {
    let sharedProps = {
        fixed,
        position: [x, y, z] as Tuple3,
        size: [width, height, depth] as Tuple3
    }

    useFrame(({ camera }) => {
        const backwardsBuffer = 2

        if (camera.position.z - backwardsBuffer > z + depth / 2) {
            removePathSection(id)
        }
    })

    if (gap) {
        return (
            <SplitBlock gap={3} {...sharedProps} />
        )
    }

    return (
        <Block {...sharedProps} />
    )
}

export default memo(PathSection)
