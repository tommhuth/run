import model from "@assets/models/road.glb"
import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import Config from "@data/Config"
import { useGLTF } from "@react-three/drei"
import { Shape, Vec3 } from "cannon-es"
import { useMemo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"
import { ShapeType, threeToCannon } from "three-to-cannon"

type GLTFResult = GLTF & {
    nodes: {
        main: Mesh
        lower: Mesh
    }
    materials: {}
}

const [width, height, depth] = [11, .75, 20]

export const ROAD_WIDTH = width
export const ROAD_BASE_WIDTH = 3.5 * 2
export const ROAD_HEIGHT = height
export const ROAD_DEPTH = depth
export const ROAD_CENTER_X = 1.5
export const ROAD_EDGE_X = ROAD_CENTER_X + 2.25
export const ROAD_FORWARD_EDGE = 75
export const ROAD_GAME_OVER_X_EDGE = 16
export const FOG_DISTANCE = 60

let sharedShape: ShapeDefinition

export default function RoadSegment({ position }) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const shape = useMemo<Shape>(() => {
        if (sharedShape) {
            return sharedShape
        }

        sharedShape = [
            [threeToCannon(nodes.main as any, { type: ShapeType.HULL })?.shape as Shape],
            [threeToCannon(nodes.lower as any, { type: ShapeType.HULL })?.shape as Shape, new Vec3(0, 0.285 / 2 - height / 2, 0)],
        ]

        return sharedShape
    }, [nodes])

    useBody({
        mass: 0,
        position: [position[0], height / 2, position[2]],
        definition: shape,
    })

    return (
        <>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.main.geometry}
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
