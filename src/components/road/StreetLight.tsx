
import model from "@assets/models/light-curved.glb"
import { streetLightMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"

const box = new Box(new Vec3(.05, 6, .05))

export default function StreetLight({ position, scale, rotation }) {
    const { nodes } = useGLTF(model)
    const [active, setActive] = useTransitionedState(false)


    useBody({
        mass: 0,
        position,
        rotation,
        active,
        definition: box,
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
