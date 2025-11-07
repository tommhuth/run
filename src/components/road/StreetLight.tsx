
import model from "@assets/models/light-curved.glb"
import { streetLightMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { useGLTF } from "@react-three/drei"
import { Box, Vec3 } from "cannon-es"

const box = new Box(new Vec3(.175, 6, .175))

export default function StreetLight({ position, scale, rotation }) {
    const { nodes } = useGLTF(model)
    const [ref] = useBody({
        mass: 0,
        position,
        rotation,
        definition: box
    })

    return (
        <mesh
            ref={ref}
            dispose={null}
            scale={scale}
            castShadow
            receiveShadow
            geometry={nodes["light-curved"].geometry}
            material={streetLightMaterial}
        />
    )
} 
