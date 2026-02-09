import model from "@assets/models/delivery.glb"
import { carMaterial } from "@components/materials/shared"
import Config from "@data/Config"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import type { GLTF } from "three/examples/jsm/Addons.js"

import { Chassis, useRigidVehicle, Wheel } from "./useRigidVehicle"

const width = 1.25
const height = 1.1
const depth = 2.55
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, 1.65 / 2)), new Vec3(0, 0, -.3)],
    [new Box(new Vec3(width / 2, .5 / 2, depth / 2)), new Vec3(0, -.2, 0)],
]
const wheelY = -.5
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
        center: [0, .85, 0],
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
                    position={[0, 0.2, -0.025]}
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
                    geometry={nodes.door.geometry}
                    material={nodes.door.material}
                    position={[0, 1.5, -1.475]}
                />

                {children}
            </group>
            <group ref={wheelsRef}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes["wheel-front-left"].geometry}
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
                    geometry={nodes["wheel-front-right"].geometry}
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
                    geometry={nodes["wheel-back-left"].geometry}
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
                    geometry={nodes["wheel-back-right"].geometry}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
            </group >
        </>
    )
}

export default memo(forwardRef(Delivery))

useGLTF.preload(model)
