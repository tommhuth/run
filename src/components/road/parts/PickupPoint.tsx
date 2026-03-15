import model from "@assets/models/leaf.glb"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { Fragment, Suspense, useMemo } from "react"

import LeafField from "../LeafField"
import PickupTarget from "../PickupTarget"
import RoadSegment from "../RoadSegment"
import StorageItem from "../StorageItem"
import StreetLight from "../StreetLight"

useGLTF.preload(model)

export default function PickupPointPart({ position, depth, id }) {
    const side = useMemo(() => random.pick(-1, 1), [])

    return (
        <Suspense fallback={null}>
            <StorageItem
                position={[7.5 * side, 1.1, 9 + position[2]]}
                name="box"
                rotation={[0, 1, 0]}
            />
            <StorageItem
                position={[9 * side, 2., 9 + position[2]]}
                name="box-open"
                rotation={[0, .6, 0]}
            />
            <StorageItem
                position={[9 * side, 1.1, 9 + position[2]]}
                name="box-large"
                rotation={[0, -.1, 0]}
            />

            <LeafField position={[13, 0, depth / 2 + position[2]]} />
            <LeafField position={[-11, 0, depth / 2 + position[2]]} />

            <PickupTarget
                pickupId={id}
                position={[side * 10, 0, position[2] + depth / 2]}
            />

            {Array.from({ length: 2 }).map((i, index) => {
                const x = 3.75
                const y = .2
                const z = position[2] + index * 20

                return (
                    <Fragment key={index}>
                        <StreetLight
                            position={[x, y, z]}
                            rotation={[0, Math.PI * .5, 0]}
                        />
                        <StreetLight
                            position={[-x, y, z]}
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
        </Suspense>
    )
}
