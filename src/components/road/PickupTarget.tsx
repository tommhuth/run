import { setMatrixAt } from "@components/materials/helpers"
import { beam } from "@components/materials/shared"
import { setState } from "@data/store/actions/actions"
import { createMessage } from "@data/store/actions/ui"
import { useStore } from "@data/store/store"
import { clamp, dampFactor, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useState } from "react"
import { CatmullRomCurve3, CylinderGeometry, InstancedMesh, Mesh, SphereGeometry, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

import { ROAD_FORWARD_EDGE } from "./const"

function biased(size: number, bias = 6) {
    return random.pick(-1, 1) * (size / 2) * Math.pow(Math.random(), bias)
}

const _target = new Vector3()
const height = 15

const cylinderGeometry = new CylinderGeometry(.5, .5, 1)
const pointGeometry = new SphereGeometry(1, 4, 2)

export default function PickupTarget({
    position: [x, y, z],
    size = 6,
    particleCount = 200,
    pickupId,
    pickupThreshold = 4,
}) {
    const materials = useStore(i => i.materials)
    const points = useMemo(() => {
        const offset = .5

        return Array.from({ length: particleCount }).map((i, index) => {
            return {
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
                    x + biased(size / 2),
                    y + random.float(0, height),
                    z + biased(size / 2),
                )
            }
        })
    }, [])
    const instanceRef = useRef<InstancedMesh>(null)
    const beamRef = useRef<Mesh>(null)
    const dotRef = useRef<Mesh>(null)
    const curve = useMemo(() => {
        const points = [
            new Vector3(x, y, z),
            new Vector3(x, y + 10, z),
            new Vector3(0, y + 3, z + 10),
            new Vector3(0, 3, z + ROAD_FORWARD_EDGE * 1.25),
        ]

        return new CatmullRomCurve3(points, false, "catmullrom", 1)
    }, [])
    const [mode, setMode] = useState<"idle" | "complete" | "missed">("idle")

    useFrame(() => {
        const { player, road } = useStore.getState()
        let score = player.score

        if (!player.vehicle || mode !== "idle") {
            return
        }

        const playerPosition = player.vehicle.chassisBody.position
        const now = Date.now()

        if (playerPosition.z > (size / 2 + z) + 6) {
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
            setMode("missed")
        } else if (
            Math.abs(playerPosition.x - x) < pickupThreshold
            && Math.abs(playerPosition.z - z) < pickupThreshold
        ) {
            const nextActivePickupIndex = road.findIndex(i => i.id !== pickupId && i.type === "pickupPoint")
            const currentIndex = road.findIndex(i => i.id === pickupId)
            const nextIndex = nextActivePickupIndex > -1 ? nextActivePickupIndex : road.length + player.pickupInterval - player.pickupCounter
            const secondsPerPart = 1.85
            const targetPartsDistance = nextIndex - currentIndex

            if (player.potentialScore > 0) {
                const diff = (player.pickupDeadline - now)
                const potentialScore = Math.round((player.potentialScore * 1000 + diff) / 10) * 10
                let message = "Delivered"

                if (diff > 1000) {
                    message += " early!"
                } else if (diff >= 0) {
                    message += " just in time"
                } else {
                    message += " late"
                }

                createMessage({
                    text: message,
                    score: potentialScore
                })

                score += potentialScore
            } else {
                createMessage({ text: "Go!" })
            }

            setState({
                player: {
                    ...player,
                    score,
                    potentialScore: targetPartsDistance,
                    pickupDeadline: now + targetPartsDistance * secondsPerPart * 1_000,
                    time: targetPartsDistance * secondsPerPart * 1_000,
                }
            })
            setMode("complete")
        }
    })

    useFrame(({ clock }, delta) => {
        if (!beamRef.current) {
            return
        }

        if (mode === "idle") {
            beamRef.current.scale.x = .5 + Math.abs(Math.cos(clock.getElapsedTime() * 2))
            beamRef.current.scale.z = .5 + Math.abs(Math.cos(clock.getElapsedTime() * 2))
        } else {
            beamRef.current.scale.x = damp(beamRef.current.scale.x, 0, 12, ndelta(delta))
            beamRef.current.scale.z = damp(beamRef.current.scale.x, 0, 12, ndelta(delta))
        }
    })

    useFrame(({ clock }, delta) => {
        const { shared: { pointLight }, player } = useStore.getState()

        if (!dotRef.current || !pointLight || !player.vehicle || player.vehicle.chassisBody.position.z < z - 50) {
            return
        }

        pointLight.color.set("#ffbb00")
        pointLight.distance = 8
        pointLight.intensity = damp(pointLight.intensity, mode === "idle" ? 250 : 0, 3, ndelta(delta))

        const dotScale = damp(dotRef.current.scale.x, mode === "idle" ? 7 : 0, 6, ndelta(delta))

        dotRef.current.scale.x = dotScale
        dotRef.current.scale.z = dotScale

        if (mode === "idle") {
            pointLight.position.set(
                x,
                3.5 + Math.cos(clock.getElapsedTime() * 4),
                z,
            )
        } else if (mode === "complete") {
            const targetPoint = points[0]

            pointLight.position.lerp(curve.getPointAt(targetPoint.time), dampFactor(targetPoint.speed, ndelta(delta)))
        }
    })

    useFrame((_, delta) => {
        if (!instanceRef.current) {
            return
        }

        for (const point of points) {
            const scale = (1 - point.position.y / height) * (point.dead ? 0 : 1)

            if (mode === "idle") {
                point.position.y += point.speed * ndelta(delta)

                if (point.position.y > height) {
                    point.position.y = 0
                    point.position.x = x + biased(size / 2)
                    point.position.z = z + biased(size / 2)
                }
            } else {
                const target = curve.getPointAt(clamp(point.time), _target)

                target.add(point.offset)
                point.position.lerp(target, dampFactor(4, ndelta(delta)))
                point.time = clamp(point.time + ndelta(delta) * point.speed * .135)

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
                visible={mode !== "missed"}
            />

            <mesh
                position={[x, .15, z]}
                geometry={cylinderGeometry}
                ref={dotRef}
                userData={{ ignoreDepthWrite: true }}
                material={materials.dot}
                scale-y={.01}
            />
            <mesh
                position={[x, y + height / 2, z]}
                geometry={cylinderGeometry}
                ref={beamRef}
                userData={{ ignoreDepthWrite: true }}
                material={materials.beam}
                scale={[1, height, 1]}
            />
        </>
    )
}
