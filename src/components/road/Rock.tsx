import { useInstance } from "@components/InstancedMesh"
import { setMatrixAt } from "@components/materials/helpers"
import { useBody } from "@data/cannon"
import { RockObject, store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { memo, useEffect, useMemo } from "react"

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
        clear: false,
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
