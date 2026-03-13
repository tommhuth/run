import model from "@assets/models/leaf.glb"
import { orange } from "@components/materials/shared"
import { useStore } from "@data/store"
import { createMessage, setState } from "@data/store/actions"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Fragment, Suspense, useMemo, useState } from "react"
import { CylinderGeometry } from "three"

import LeafField from "../LeafField"
import RoadSegment from "../RoadSegment"
import StorageItem from "../StorageItem"
import StreetLight from "../StreetLight"

useGLTF.preload(model)

const geo = new CylinderGeometry(1, 1, 10, 8, 1)

export default function PickupPointPart({ position, depth, id }) {
    const side = useMemo(() => random.pick(-1, 1), [])
    const [pickedUp, setPickedUp] = useState(false)

    useFrame(() => {
        const { player, road } = useStore.getState()
        const pickupThreshold = 4.5
        let score = player.score

        if (!player.vehicle || pickedUp) {
            return
        }

        if (player.vehicle.chassisBody.position.z > (depth / 2 + position[2]) + 6) {
            const penalty = 5000

            createMessage({
                text: "You missed your destination!",
                score: -penalty
            })
            setState({
                player: {
                    ...player,
                    potentialScore: 0,
                    pickupDeadline: Infinity,
                    score: score - penalty
                }
            })
            setPickedUp(true)
        } else if (
            Math.abs(player.vehicle.chassisBody.position.x - (position[0] + side * 15)) < pickupThreshold
            && Math.abs(player.vehicle.chassisBody.position.z - (depth / 2 + position[2])) < pickupThreshold
        ) {
            const nextActivePickupIndex = road.findIndex(i => i.id !== id && i.type === "pickupPoint")
            const currentIndex = road.findIndex(i => i.id === id)
            const nextIndex = nextActivePickupIndex > -1 ? nextActivePickupIndex : road.length + player.pickupInterval - player.pickupCounter
            const secondsPerPart = 2.25
            const targetPartsDistance = nextIndex - currentIndex

            if (player.potentialScore > 0) {
                const diff = (player.pickupDeadline - Date.now())
                const potentialScore = Math.round((player.potentialScore * 1000 + diff) / 10) * 10
                let message = "Delivered"

                if (diff > 1000) {
                    message += " with time to spare"
                } else if (diff >= 0) {
                    message += " just in time!"
                } else {
                    message += " with late delivery penality"
                }

                createMessage({
                    text: message,
                    score: potentialScore
                })

                score += potentialScore
            } else {
                createMessage({ text: "Reach delivery destination in time!" })
            }

            setState({
                player: {
                    ...player,
                    score,
                    potentialScore: targetPartsDistance,
                    pickupDeadline: Date.now() + targetPartsDistance * secondsPerPart * 1_000
                }
            })
            setPickedUp(true)
        }
    })

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

            <mesh
                visible={!pickedUp}
                position={[side * 15, 0, position[2] + depth / 2]}
                material={orange}
                geometry={geo}
            />

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
        </Suspense>
    )
}
