import { useInstance } from "@components/InstancedMesh"
import { useBody } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { RockObject, store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { memo, useMemo } from "react"

function Rock({
    position,
    scale,
    rotation,
    radius,
}: RockObject) {
    const [active, setActive] = useTransitionedState(false)
    const shape = useMemo(() => {
        return new Sphere(radius * .85)
    }, [])

    useInstance("rock", {
        keepAround: true,
        position,
        scale: [radius * 2, radius * 2 * scale[1], radius * 2],
        rotation
    })

    useBody({
        mass: 0,
        position,
        definition: shape,
        rotation,
        active,
    })

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        let currentActive = Math.abs(vehicle.chassisBody.position.z - z) < 15

        if (vehicle.chassisBody.position.z > z + 2) {
            currentActive = false
        }

        if (active !== currentActive) {
            setActive(currentActive)
        }
    })

    return null
}

export default memo(Rock)
