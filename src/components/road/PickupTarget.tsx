import { setMatrixAt } from "@components/materials/helpers"
import { beam } from "@components/materials/shared"
import { useStore } from "@data/store"
import { createMessage, setState } from "@data/store/actions"
import { clamp, dampFactor, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useState } from "react"
import { CatmullRomCurve3, CylinderGeometry, InstancedMesh, Mesh, PointLight, SphereGeometry, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

import { ROAD_FORWARD_EDGE } from "./const"

function biased(size: number, bias = 6) {
    return random.pick(-1, 1) * (size / 2) * Math.pow(Math.random(), bias)
}

const _target = new Vector3()
const height = 15

const cylinderGeometry = new CylinderGeometry(.5, .5, height)
const pointGeometry = new SphereGeometry(1, 4, 2)

export default function PickupTarget({
    position,
    size = 6,
    particleCount = 200,
    pickupId,
    pickupThreshold = 6,
}) {
    const materials = useStore(i => i.materials)
    const points = useMemo(() => {
        const offset = .5

        return Array.from({ length: particleCount }).map((i, index) => {
            return {
                id: random.id(),
                index,
                speed: random.float(2, 20),
                size: random.float(.1, .2),
                time: 0,
                dead: false,
                offset: new Vector3(
                    random.float(-offset, offset),
                    random.float(-offset, offset),
                    random.float(-offset, offset)
                ),
                position: new Vector3(
                    position[0] + biased(size / 2),
                    position[1] + random.float(0, height),
                    position[2] + biased(size / 2),
                )
            }
        })
    }, [])
    const instanceRef = useRef<InstancedMesh>(null)
    const beamRef = useRef<Mesh>(null)
    const lightRef = useRef<PointLight>(null)
    const curve = useMemo(() => {
        const points = [
            new Vector3(...position),
            new Vector3(position[0], position[1] + 10, position[2]),
            new Vector3(0, position[1] + 3, position[2] + 10),
            new Vector3(0, 3, position[2] + ROAD_FORWARD_EDGE * 1.25),
        ]

        return new CatmullRomCurve3(points, false, "catmullrom", 1)
    }, [])
    const [idle, setIdle] = useState(true)

    useFrame(() => {
        const { player, road } = useStore.getState()
        let score = player.score

        if (!player.vehicle || !idle) {
            return
        }

        if (player.vehicle.chassisBody.position.z > (size / 2 + position[2]) + 6) {
            const penalty = 10_000

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
            setIdle(true)
        } else if (
            Math.abs(player.vehicle.chassisBody.position.x - position[0]) < pickupThreshold
            && Math.abs(player.vehicle.chassisBody.position.z - position[2]) < pickupThreshold
        ) {
            const nextActivePickupIndex = road.findIndex(i => i.id !== pickupId && i.type === "pickupPoint")
            const currentIndex = road.findIndex(i => i.id === pickupId)
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
                    pickupDeadline: Date.now() + targetPartsDistance * secondsPerPart * 1_000,
                    time: targetPartsDistance * secondsPerPart * 1_000,
                }
            })
            setIdle(false)
        }
    })

    useFrame((state, delta) => {
        if (!beamRef.current || !lightRef.current) {
            return
        }

        if (idle) {
            beamRef.current.scale.x = .5 + Math.abs(Math.cos(state.clock.getElapsedTime() * 2)) * (idle ? 1 : 0)
            beamRef.current.scale.z = .5 + Math.abs(Math.cos(state.clock.getElapsedTime() * 2)) * (idle ? 1 : 0)
            lightRef.current.position.y = 3.5 + Math.cos(state.clock.getElapsedTime() * 4) * 1 * (idle ? 1 : 0)
        } else {
            beamRef.current.scale.x = damp(beamRef.current.scale.x, 0, 12, delta)
            beamRef.current.scale.z = damp(beamRef.current.scale.x, 0, 12, delta)

            lightRef.current.position.lerp(curve.getPointAt(points[0].time), dampFactor(points[0].speed, delta))
        }
    })

    useFrame((state, delta) => {
        if (!instanceRef.current) {
            return
        }

        for (const point of points) {
            const scale = (1 - point.position.y / height) * (point.dead ? 0 : 1)

            if (idle) {
                point.position.y += point.speed * ndelta(delta)

                if (point.position.y > height) {
                    point.position.y = 0
                    point.position.x = position[0] + biased(size / 2)
                    point.position.z = position[2] + biased(size / 2)
                }
            } else {
                const target = curve.getPointAt(clamp(point.time), _target)

                target.add(point.offset)
                point.position.lerp(target, dampFactor(4, delta))
                point.time = clamp(point.time + delta * point.speed * .135)

                if (point.time > .99) {
                    point.dead = true
                }
            }

            setMatrixAt({
                position: point.position,
                index: point.index,
                scale: point.size * scale,
                instance: instanceRef.current
            })
        }
    })

    return (
        <>
            <instancedMesh
                args={[pointGeometry, beam, particleCount]}
                ref={instanceRef}
                frustumCulled={false}
            />

            <mesh
                position={[
                    position[0],
                    position[1] + height / 2,
                    position[2],
                ]}
                geometry={cylinderGeometry}
                ref={beamRef}
                userData={{ ignoreDepthWrite: true }}
                material={materials.beam}
            />

            <pointLight
                position-x={position[0]}
                position-z={position[2]}
                distance={8}
                intensity={350}
                ref={lightRef}
                color={"#ffbb00"}
            />
        </>
    )
}
