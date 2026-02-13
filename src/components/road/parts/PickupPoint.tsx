import model from "@assets/models/leaf.glb"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { Fragment, useMemo } from "react"

import LeafField from "../LeafField"
import RoadSegment from "../RoadSegment"
import StorageItem from "../StorageItem"
import StreetLight from "../StreetLight"

useGLTF.preload(model)

export default function PickupPointPart({ position, depth }) {
    const side = useMemo(() => 1 || random.pick(-1, 1), [])

    return (
        <>
            <StorageItem
                position={[7.5 * side, 1, 9 + position[2]]}
                name="box"
                rotation={[0, 1, 0]}
            />
            <StorageItem
                position={[9 * side, 2, 9 + position[2]]}
                name="box-open"
                rotation={[0, .6, 0]}
            />
            <StorageItem
                position={[9 * side, 1, 9 + position[2]]}
                name="box-large"
                rotation={[0, -.1, 0]}
            />

            <LeafField position={[-10, 0, position[2] + depth / 2]} />
            <LeafField position={[12, 0, position[2] + depth / 2]} />


            {Array.from({ length: 2 }).map((i, index) => {
                const x = 3.75
                const y = .2
                const z = position[2] + index * 20

                return (
                    <Fragment key={index}>
                        <StreetLight
                            position={[x, y, z]}
                            scale={7}
                            rotation={[0, Math.PI * .5, 0]}
                        />
                        <StreetLight
                            position={[-x, y, z]}
                            scale={7}
                            rotation={[0, -Math.PI * .5, 0]}
                        />
                    </Fragment>
                )
            })}

            <RoadSegment
                position={[
                    position[0],
                    position[1],
                    position[2] + depth / 2,
                ]}
            />
        </>
    )
}
