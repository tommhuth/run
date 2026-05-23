import model from "@assets/models/suv-luxury.glb"
import { carMaterial } from "@components/materials/shared"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import type { GLTF } from "three/examples/jsm/Addons.js"

import { Chassis, useRigidVehicle, Wheel, wheelKey } from "./useRigidVehicle"

const width = 1.15
const height = 1.1
const depth = 2.35
const wheelY = .3
const wheelX = .4
const radius = .3
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2)), new Vec3(0, height / 2 + wheelY, -.1)],
]
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .81],
        radius
    },
    {
        position: [-wheelX, wheelY, .81],
        radius
    },
    {
        position: [wheelX, wheelY, -.75],
        radius
    },
    {
        position: [-wheelX, wheelY, -.75],
        radius
    }
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

interface SuvLuxuryProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function SuvLuxury({ children, ...props }: SuvLuxuryProps, ref: ForwardedRef<RigidVehicle>) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [chassisRef, wheelsRef, vehicle] = useRigidVehicle({
        ...props,
        mass: 8,
        wheels,
        chassis
    })

    useImperativeHandle(ref, () => {
        return vehicle
    }, [vehicle])

    return (
        <>
            <group
                ref={chassisRef}
                dispose={null}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.body.geometry}
                    position={[0, 0.125, -.0025]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                    />
                </mesh>

                {children}
            </group>
            <group
                dispose={null}
                ref={wheelsRef}
            >
                {Array.from({ length: 4 }).map((i, index) => {
                    return (
                        <mesh
                            key={index}
                            castShadow
                            receiveShadow
                            geometry={nodes[wheelKey[index]].geometry}
                            position={wheels[index].position}
                        >
                            <primitive
                                attach="material"
                                object={carMaterial}
                            />
                        </mesh>
                    )
                })}
            </group>
        </>
    )
}

export default memo(forwardRef(SuvLuxury))

useGLTF.preload(model)
