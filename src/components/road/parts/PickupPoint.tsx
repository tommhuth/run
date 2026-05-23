
import random from "@huth/random"
import { Fragment, Suspense, useMemo } from "react"

import PickupTarget from "../PickupTarget"
import RoadSegment from "../RoadSegment"
import StreetLight from "../StreetLight"

export default function PickupPointPart({ position, depth, id }) {
    const side = useMemo(() => random.pick(-1, 1), [])

    return (
        <Suspense fallback={null}>
            <PickupTarget
                pickupId={id}
                position={[side * 8.5, 0, position[2] + depth / 2]}
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
