import model from "@assets/models/garbage-truck.glb"
import { carMaterial } from "@components/materials/shared"
import Config from "@data/Config"
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
        position: [wheelX, wheelY, 1.11],
        radius
    },
    {
        position: [-wheelX, wheelY, 1.11],
        radius
    },
    {
        position: [wheelX, wheelY, -.51],
        radius
    },
    {
        position: [-wheelX, wheelY, -.51],
        radius
    }
]

const width = 1.4
const height = 1.3
const depth = 3.35
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2)), new Vec3(0, height / 2 + wheelY, 0)],
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        trash: Mesh
        arm: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

interface GarbageTruckProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function GarbageTruck({ children, ...props }: GarbageTruckProps, ref: ForwardedRef<RigidVehicle>) {
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
                    geometry={nodes.arm.geometry}
                    material={nodes.arm.material}
                    position={[0, 0.48, 0.325]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.body.geometry}
                    position={[0, .125, 0.025]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.trash.geometry}
                    position={[0.016, 1.275, -0.133]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.trash.geometry}
                    position={[0.016, .9, -1.1]}
                    rotation-x={-.6}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>

                {children}
            </group>
            <group ref={wheelsRef}>
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
                                wireframe={Config.DEBUG}
                            />
                        </mesh>
                    )
                })}
            </group>
        </>
    )
}

export default memo(forwardRef(GarbageTruck))

useGLTF.preload(model)
