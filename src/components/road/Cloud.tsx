import { Cloud, store } from "@data/store"
import { repositionCloud } from "@data/store/actions"
import { ndelta, useLowerPriorityFrame } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { memo, useLayoutEffect, useRef } from "react"
import { Euler, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion } from "three"
import { damp } from "three/src/math/MathUtils.js"

const width = 14
const height = 6
const geometry = new PlaneGeometry(width, height, 1, 1)

geometry.rotateY(Math.PI * 1)

const _euler = new Euler()
const _quaternion = new Quaternion()

function CloudComponent({
    speed,
    position,
    scale = 1,
    damping,
    id,
    material
}: Cloud & { material: MeshBasicMaterial }) {
    const ref = useRef<Mesh>(null)

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }

        ref.current.position.y = -height / 2 * scale
    }, [position])

    useFrame((state, delta) => {
        const { player: { vehicle } } = store.getState()

        if (!ref.current || !vehicle) {
            return
        }

        _euler.setFromQuaternion(_quaternion.copy(vehicle.chassisBody.quaternion))
        ref.current.rotation.y = _euler.y

        ref.current.position.y = damp(ref.current.position.y, 1, damping, ndelta(delta))
        ref.current.position.x -= ndelta(delta) * speed
    })

    useLowerPriorityFrame(() => {
        const { state, player: { vehicle } } = store.getState()

        if (!vehicle || state == "gameover") {
            return
        }

        if (position[2] < vehicle.chassisBody.position.z - 6) {
            repositionCloud(id)
        }
    }, 10)

    return (
        <mesh
            ref={ref}
            userData={{ ignoreDepthWrite: true }}
            position-x={position[0]}
            position-z={position[2]}
            scale={scale}
            dispose={null}
            geometry={geometry}
            material={material}
        />
    )
}

export default memo(CloudComponent)
