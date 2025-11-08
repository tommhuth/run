import { store } from "@data/store"
import { ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { memo, useLayoutEffect, useRef } from "react"
import { Euler, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion } from "three"
import { damp } from "three/src/math/MathUtils.js"

const width = 11
const height = 6
const geometry = new PlaneGeometry(width, height, 1, 1)

geometry.rotateY(Math.PI * 1)

export interface CloudProps {
    speed: number
    position: Tuple3
    scale?: number
    id: string
    damping: number
}

const _euler = new Euler()
const _quaternion = new Quaternion()

function Cloud({
    speed,
    position,
    scale = 1,
    damping,
    material
}: CloudProps & { material: MeshBasicMaterial }) {
    const ref = useRef<Mesh>(null)

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

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }

        ref.current.position.y = -height / 2 * scale
    }, [position])

    return (
        <mesh
            ref={ref}
            userData={{ ignoreDepthWrite: true }}
            position-x={position[0]}
            position-z={position[2]}
            scale={scale}
            geometry={geometry}
            material={material}
        />
    )
}

export default memo(Cloud)
