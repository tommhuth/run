
import model from "@assets/models/light-curved.glb"
import { streetLightMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { useGLTF } from "@react-three/drei"
import { Box, Vec3 } from "cannon-es"

const box = new Box(new Vec3(.175, 6, .175))

export default function StreetLight({ position, scale, rotation }) {
    const { nodes } = useGLTF(model)

    useBody({
        mass: 0,
        position,
        rotation,
        definition: box,
    })

    return (
        <mesh
            dispose={null}
            scale={scale}
            rotation={rotation}
            position={position}
            castShadow
            receiveShadow
            geometry={nodes["light-curved"].geometry}
            material={streetLightMaterial}
        />
    )
} 
