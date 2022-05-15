
import { memo, useEffect, useState } from "react"
import Box from "../../Box"
import PathSettings from "../../../data/const/PathSettings"
import random from "@huth/random"
import { Only } from "../../../utils/utils"

function Plain({
    start,
    depth,
    end,
    y,
    x,
    width = PathSettings.BASE_WIDTH
}) {
    let height = 30 //PathSettings.BASE_HEIGHT
    let [pos] = useState(() => [random.integer(-width / 2, width / 2), y + height / 2 + 3, random.integer(start, start + depth)])
    let [rot] = useState(() => [random.float(-.5, .5), random.float(0, Math.PI * 2), random.float(-.5, .5)])
    let [size] = useState(() => random.pick(2, 2.5, 3))
    let [should] = useState(() => random.boolean())



    return (
        <>
            <Only if={should}>
                <Box
                    mass={.5}
                    height={size}
                    depth={size}
                    width={size}
                    noanim
                    x={pos[0]}
                    y={pos[1]}
                    z={pos[2]}
                    rotationX={rot[0]}
                    rotationY={rot[1]}
                    rotationZ={rot[2]}
                />
            </Only>

            <Box
                mass={0}
                height={height}
                depth={depth}
                width={width}
                x={x}
                y={-height / 2 + y}
                z={start + depth / 2}
            />
        </>

    )
}

export default memo(Plain)