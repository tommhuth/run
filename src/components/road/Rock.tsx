import model from "@assets/models/rock.glb"
import { rockMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { RockObject, store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { memo, useMemo } from "react"



function Rock({
    position,
    scale,
    rotation,
    radius,
}: RockObject) {
    const { nodes } = useGLTF(model)
    const [active, setActive] = useTransitionedState(false)
    const shape = useMemo(() => {
        return new Sphere(radius * .85)
    }, [])

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


    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.rock.geometry}
            scale={radius * 2}
            scale-y={radius * 2 * scale[1]}
            material={rockMaterial}
            dispose={null}
            position={position}
            rotation={rotation}
        />
    )
}

export default memo(Rock)
