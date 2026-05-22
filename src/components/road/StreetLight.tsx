import { useInstance } from "@components/InstancedMesh"
import { useBody } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"

const box = new Box(new Vec3(.05, 6, .05))

export default function StreetLight({
    position,
    scale = 6.5,
    rotation
}) {
    const [active, setActive] = useTransitionedState(false)

    useInstance("streetLight", {
        scale,
        rotation,
        position,
        clear: false
    })

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

    return null
} 
