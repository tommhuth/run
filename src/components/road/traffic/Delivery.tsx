import model from "@assets/models/delivery.glb"
import { carMaterial } from "@components/materials/shared"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import type { GLTF } from "three/examples/jsm/Addons.js"

import { Chassis, useRigidVehicle, Wheel, wheelKey } from "./useRigidVehicle"

const wheelY = .3
const wheelX = .4
const radius = .3
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, 1.01],
        radius
    },
    {
        position: [-wheelX, wheelY, 1.01],
        radius
    },
    {
        position: [wheelX, wheelY, -.61],
        radius
    },
    {
        position: [-wheelX, wheelY, -.61],
        radius
    }
]

const width = 1.4
const height = 1.3
const depth = 3.15
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2)), new Vec3(0, wheelY + height / 2, 0)],
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        door: Mesh
        ["wheel-back"]: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

interface DeliveryProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function Delivery({ children, ...props }: DeliveryProps, ref: ForwardedRef<RigidVehicle>) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [chassisRef, wheelsRef, vehicle] = useRigidVehicle({
        ...props,
        mass: 7,
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
                    position={[0, .15, -0.025]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.door.geometry}
                    material={carMaterial}
                    position={[0, 1.65, -1.475]}
                />

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

export default memo(forwardRef(Delivery))

useGLTF.preload(model)
