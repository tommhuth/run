import model from "@assets/models/road.glb"
import { ShapeDefinition, useBody } from "@data/cannon"
import Config from "@data/Config"
import { store } from "@data/store"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box, Shape, Vec3 } from "cannon-es"
import { useMemo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"
import { ShapeType, threeToCannon } from "three-to-cannon"

import Rocks from "./Rocks"
import StreetLights from "./StreetLights"
import { Trees } from "./Trees"
import CloudSystem from "./CloudSystem"

type GLTFResult = GLTF & {
    nodes: {
        Cube: Mesh
    }
    materials: {}
}

const [, height, depth] = [9, .75, 500]

export const ROAD_HEIGHT = height
export const ROAD_CENTER_X = 1.5

export default function Road() {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const shape = useMemo<Shape | undefined>(() => {
        let h = threeToCannon(nodes.Cube as any, { type: ShapeType.HULL })

        return h?.shape
    }, [nodes.Cube])
    const [ref, body] = useBody({
        mass: 0,
        position: [0, height / 2, depth * .25],
        definition: shape as ShapeDefinition
    })

    useFrame(() => {
        let { player } = store.getState()

        if (player.vehicle && player.vehicle?.chassisBody.position.z > body.position.z) {
            body.position.z += depth * .25
        }
    })

    return (
        <>
            <Rocks />
            <Trees />
            <StreetLights />
            <CloudSystem />

            <group
                dispose={null}
                ref={ref}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube.geometry}
                    material={nodes.Cube.material}
                    scale={1}
                    position={[0, 0, 0]}
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


let floorShape = new Box(new Vec3(5000, .5, 5000))

export function Floor() {
    const [ref] = useBody({
        mass: 0,
        definition: floorShape,
        position: [0, -.5, 0]
    })
    let size = 1000

    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[size, 1, size, 1, 1, 1]} />
            <meshPhongMaterial color="#ccc" name="floor" />
        </mesh>
    )
}
