import model from "@assets/models/road.glb"
import { ShapeDefinition, useBody } from "@data/cannon"
import { useStore } from "@data/store/store"
import { useGLTF } from "@react-three/drei"
import { Shape, Vec3 } from "cannon-es"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"
import { ShapeType, threeToCannon } from "three-to-cannon"

import { ROAD_HEIGHT } from "./const"

type GLTFResult = GLTF & {
    nodes: {
        main: Mesh
        lower: Mesh
    }
    materials: {}
}

let sharedShape: ShapeDefinition | undefined

function getRoadShape(nodes: GLTFResult["nodes"]): ShapeDefinition {
    sharedShape ??= [
        [threeToCannon(nodes.main as any, { type: ShapeType.HULL })?.shape as Shape],
        [threeToCannon(nodes.lower as any, { type: ShapeType.HULL })?.shape as Shape, new Vec3(0, 0.2 / 2 - ROAD_HEIGHT / 2, 0)],
    ]

    return sharedShape
}

export default function RoadSegment({ position }) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const roadMaterial = useStore(i => i.materials.road)
    const shape = getRoadShape(nodes)

    useBody({
        mass: 0,
        position: [position[0], ROAD_HEIGHT / 2, position[2]],
        definition: shape,
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.main.geometry}
            dispose={null}
            material={roadMaterial}
            position={[position[0], ROAD_HEIGHT / 2, position[2]]}
        />
    )
}

useGLTF.preload(model)
