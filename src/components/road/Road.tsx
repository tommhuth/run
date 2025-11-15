import model from "@assets/models/road.glb"
import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import Config from "@data/Config"
import { store, useStore } from "@data/store"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box, Shape, Vec3 } from "cannon-es"
import { useMemo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"
import { ShapeType, threeToCannon } from "three-to-cannon"

import CloudSystem from "./CloudSystem"
import RockObject from "./Rock"
import StreetLights from "./StreetLights"
import TreeObject from "./Tree"

type GLTFResult = GLTF & {
    nodes: {
        Cube: Mesh
    }
    materials: {}
}

const [, height, depth] = [9, .75, 500]

export const ROAD_HEIGHT = height
export const ROAD_CENTER_X = 1.5
export const ROAD_EDGE_X = ROAD_CENTER_X + 2.25
export const ROAD_FORWARD_EDGE = 75
export const ROAD_GAME_OVER_X_EDGE = 16
export const FOG_DISTANCE = 60

function Objects() {
    const objects = useStore(i => i.objects)

    return objects.map(i => {
        switch (i.type) {
            case "rock":
                return <RockObject {...i} key={i.id} />
            case "tree":
                return <TreeObject {...i} key={i.id} />
            default:
                return null
        }
    })
}

export default function Road() {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const shape = useMemo<Shape | undefined>(() => {
        const result = threeToCannon(nodes.Cube as any, { type: ShapeType.HULL })

        return result?.shape
    }, [nodes.Cube])
    const [ref, body] = useBody({
        mass: 0,
        position: [0, height / 2, depth * .25],
        definition: shape as ShapeDefinition,
        active: true
    })

    useFrame(() => {
        const { player } = store.getState()

        if (player.vehicle && player.vehicle?.chassisBody.position.z > body.position.z) {
            body.position.z += depth * .25
        }
    })

    return (
        <>
            <CloudSystem />
            <Objects />
            <StreetLights />

            <group
                dispose={null}
                ref={ref}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube.geometry}
                    material={floorMaterial}
                />

                {Config.DEBUG && (
                    <>
                        <mesh
                            position={[ROAD_CENTER_X, ROAD_HEIGHT / 2, 0]}
                        >
                            <boxGeometry args={[.1, .1, 3000]} />
                            <meshBasicMaterial color="blue" />
                        </mesh>
                        <mesh
                            position={[-ROAD_CENTER_X, ROAD_HEIGHT / 2, 0]}
                        >
                            <boxGeometry args={[.1, .1, 3000]} />
                            <meshBasicMaterial color="blue" />
                        </mesh>
                    </>
                )}
            </group>
        </>
    )
}

/*

            <Trees />
            <StreetLights />
            {Array.from({ length: 10 }).map((i, index) => {
                return (
                    <Fragment key={index}>
                        <Grass position={[20, 0, index * 13]} side={"left"} />
                        <Grass position={[-20, 0, index * 13]} side={"right"} />
                    </Fragment>
                )
            })}
            */

const floorShape = new Box(new Vec3(depth, .5, depth))

export function Floor() {
    const [ref, body] = useBody({
        mass: 0,
        definition: floorShape,
        position: [0, -.5, 0],
        active: true
    })

    useFrame(() => {
        const { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        if (player.vehicle.chassisBody.position.z > body.position.z + depth * .5 * .75) {
            body.position.z += depth * .5
        }
    })

    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
            material={floorMaterial}
        >
            <boxGeometry args={[depth, 1, depth * 2, 1, 1, 1]} />
        </mesh>
    )
}
