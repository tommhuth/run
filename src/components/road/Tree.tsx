import { useInstance } from "@components/InstancedMesh"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import { InstanceName } from "@data/store/actions"
import { useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { memo } from "react"

const shape = new Box(new Vec3(.1, 5, .1))

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
    const [active, setActive] = useTransitionedState(false)
    const name = `tree${treeType + 1}` as InstanceName

    useInstance(name, {
        position,
        rotation,
        scale
    })

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

    return null
}

export default memo(Tree)

