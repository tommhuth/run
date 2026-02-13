import model from "@assets/models/storage.glb"
import { storageMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { useMemo } from "react"

const names = ["barrel", "barrel-open", "box", "box-open", "box-large", "box-large-open"] as const

type ModelProps = {
    name: typeof names[number]
    rotation?: Tuple3
    position: Tuple3
}

export default function StorageItem({
    name,
    position,
    rotation,
    ...props
}: ModelProps) {
    const scale = 1
    const [width, height, depth] = [1, 1, name.includes("large") ? 2 : 1]
    const { nodes } = useGLTF(model)
    const definition = useMemo(() => new Box(new Vec3(width / 2 * scale, height / 2 * scale, depth / 2 * scale)), [])
    const [ref] = useBody({
        definition,
        mass: .25,
        position,
        rotation
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes[name].geometry}
            material={storageMaterial}
            ref={ref}
            dispose={null}
            scale={scale}
            {...props}
        />
    )
}

useGLTF.preload(model)
