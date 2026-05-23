import model from "@assets/models/truck-flat.glb"
import { carMaterial } from "@components/materials/shared"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import type { GLTF } from "three/examples/jsm/Addons.js"

import { Chassis, useRigidVehicle, Wheel, wheelKey } from "./useRigidVehicle"

const width = 1.25
const height = 1.1
const depth = 2.55
const wheelY = .3
const wheelX = .4
const radius = .3
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, 1.65 / 2)), new Vec3(0, height / 2 + wheelY, -.3)],
    [new Box(new Vec3(width / 2, .5 / 2, depth / 2)), new Vec3(0, height / 2 + wheelY, 0)],
]
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .78],
        radius
    },
    {
        position: [-wheelX, wheelY, .78],
        radius
    },
    {
        position: [wheelX, wheelY, -.63],
        radius
    },
    {
        position: [-wheelX, wheelY, -.63],
        radius
    }
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        ["wheel-back"]: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

interface TruckFlatProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function TruckFlat({ children, ...props }: TruckFlatProps, ref: ForwardedRef<RigidVehicle>) {
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
                    position={[0, 0.15, 0]}
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

export default memo(forwardRef(TruckFlat))

useGLTF.preload(model)
