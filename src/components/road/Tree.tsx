import model from "@assets/models/trees.glb"
import { treeMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { memo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

const shape = new Box(new Vec3(.25, 5, .25))

type GLTFResult = GLTF & {
    nodes: {
        tree1: Mesh
        tree2: Mesh
        tree3: Mesh
        tree4: Mesh
        tree5: Mesh
        tree6: Mesh
    }
}

interface TreeProps {
    treeType?: number
    position: Tuple3
    rotation?: Tuple3
    scale?: number
}

function Tree({
    treeType = 0,
    position,
    rotation,
    scale = 1,
}: TreeProps) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [active, setActive] = useTransitionedState(false)

    useBody({
        position,
        active,
        rotation,
        mass: 0,
        definition: shape,
    })

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        const dist = 10
        let currentActive = Math.abs(vehicle.chassisBody.position.z - z) < dist

        if (vehicle.chassisBody.position.z > z + 2) {
            currentActive = false
        }

        if (active !== currentActive) {
            setActive(currentActive)
        }
    })

    return (
        <group
            scale={scale}
            dispose={null}
            position={position}
            rotation={rotation}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree5.geometry}
                material={treeMaterial}
                visible={treeType === 0}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree4.geometry}
                material={treeMaterial}
                visible={treeType === 1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree3.geometry}
                material={treeMaterial}
                visible={treeType === 2}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree2.geometry}
                material={treeMaterial}
                visible={treeType === 3}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree6.geometry}
                material={treeMaterial}
                visible={treeType === 4}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree1.geometry}
                material={treeMaterial}
                visible={treeType === 5}
            />
        </group>
    )
}

export default memo(Tree)

useGLTF.preload(model)
