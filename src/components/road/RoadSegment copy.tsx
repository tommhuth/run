import model from "@assets/models/road.glb"
import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import Config from "@data/Config"
import { useGLTF } from "@react-three/drei"
import { Shape } from "cannon-es"
import { useMemo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"
import { ShapeType, threeToCannon } from "three-to-cannon"

type GLTFResult = GLTF & {
    nodes: {
        Cube: Mesh
    }
    materials: {}
}

const [, height, depth] = [11, .75, 40]

export const ROAD_HEIGHT = height
export const ROAD_CENTER_X = 1.5
export const ROAD_EDGE_X = ROAD_CENTER_X + 2.25
export const ROAD_FORWARD_EDGE = 75
export const ROAD_GAME_OVER_X_EDGE = 16
export const FOG_DISTANCE = 60

export default function RoadSegment({ position }) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const shape = useMemo<Shape | undefined>(() => {
        const result = threeToCannon(nodes.Cube as any, { type: ShapeType.HULL })

        return result?.shape
    }, [nodes.Cube])

    useBody({
        mass: 0,
        position: [position[0], height / 2, position[2]],
        definition: shape as ShapeDefinition,
        active: true
    })

    return (
        <>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube.geometry}
                material={floorMaterial}
                position={[position[0], height / 2, position[2]]}
            />

            {Config.DEBUG && false && (
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
        </>
    )
}
