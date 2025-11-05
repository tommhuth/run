import model from "@assets/models/sedan-sports.glb"
import Config from "@data/Config"
import { Chassis, useRigidVehicle, Wheel } from "@data/useRigidVehicle"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { forwardRef, useImperativeHandle } from "react"

const width = 1.3
const height = .95
const depth = 2.4
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2))],
]
const wheelY = -.5
const wheelX = .4
const radius = .3
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .7],
        radius
    },
    {
        position: [-wheelX, wheelY, .7],
        radius
    },
    {
        position: [wheelX, wheelY, -.7],
        radius
    },
    {
        position: [-wheelX, wheelY, -.7],
        radius
    }
]

export const Sedan = forwardRef<RigidVehicle, { position: Tuple3; rotation: Tuple3 }>((props, ref) => {
    const { nodes, materials } = useGLTF(model)
    let [chassisRef, wheelsRef, vehicle, backWheelsRef] = useRigidVehicle({
        ...props,
        center: [0, .7, 0],
        wheels,
        chassis,
        mass: 4
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
                <group  >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.spoiler.geometry}
                        position={[0, 0.45, -1.044]}
                    >
                        <primitive
                            attach="material"
                            object={materials.colormap}
                            wireframe={Config.DEBUG}
                        />
                    </mesh>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.body.geometry}
                        position={[0, 0.15, -0.025]}
                    >
                        <primitive
                            attach="material"
                            object={materials.colormap}
                            wireframe={Config.DEBUG}
                        />
                    </mesh>
                    <group ref={backWheelsRef}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes["wheel-back-left"].geometry}
                            position={[wheels[2].position[0], wheels[2].position[1] + .7, wheels[2].position[2]]}
                        >
                            <primitive
                                attach="material"
                                object={materials.colormap}
                                wireframe={Config.DEBUG}
                            />
                        </mesh>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes["wheel-back-right"].geometry}
                            position={[wheels[3].position[0], wheels[3].position[1] + .7, wheels[3].position[2]]}
                        >
                            <primitive
                                attach="material"
                                object={materials.colormap}
                                wireframe={Config.DEBUG}
                            />
                        </mesh>
                    </group>
                </group>
            </group>
            <group ref={wheelsRef}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes["wheel-front-left"].geometry}
                >
                    <primitive
                        attach="material"
                        object={materials.colormap}
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
                        object={materials.colormap}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
            </group>
        </>
    )
})
