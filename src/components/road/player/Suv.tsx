import model from "@assets/models/suv.glb"
import { carMaterial } from "@components/materials/shared"
import { Chassis, useRigidVehicle, Wheel, wheelKey } from "@components/road/traffic/useRigidVehicle"
import Config from "@data/Config"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import type { GLTF } from "three/examples/jsm/Addons.js"



const wheelX = .4
const radius = .3
const wheelY = 0.3


const width = 1.3
const height = 1
const depth = 2.35
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2)), new Vec3(0, height / 2 + wheelY, 0)],
]

const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .75],
        radius
    },
    {
        position: [-wheelX, wheelY, .75],
        radius
    },
    {
        position: [wheelX, wheelY, -.55],
        radius
    },
    {
        position: [-wheelX, wheelY, -.55],
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

interface SuvProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function Suv({ children, ...props }: SuvProps, ref: ForwardedRef<RigidVehicle>) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [chassisRef, wheelsRef, vehicle] = useRigidVehicle({
        ...props,
        mass: 13,
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
                <mesh visible={Config.DEBUG}>
                    <sphereGeometry args={[.125]} />
                    <meshBasicMaterial color="red" />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.body.geometry}
                    position={[0, .2, 0]}
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
                    geometry={nodes["wheel-back"].geometry}
                    position={[0, 0.5, -1.05]}
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

export default memo(forwardRef(Suv))

useGLTF.preload(model)
