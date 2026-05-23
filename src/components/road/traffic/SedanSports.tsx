import model from "@assets/models/sedan-sports.glb"
import { carMaterial } from "@components/materials/shared"
import Config from "@data/Config"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, ReactNode, useImperativeHandle } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

import { Chassis, useRigidVehicle, Wheel, wheelKey } from "./useRigidVehicle"

const wheelX = .4
const radius = .3
const wheelY = .3
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .66],
        radius
    },
    {
        position: [-wheelX, wheelY, .66],
        radius
    },
    {
        position: [wheelX, wheelY, -.66],
        radius
    },
    {
        position: [-wheelX, wheelY, -.66],
        radius
    }
]

const width = 1.2
const height = .8
const depth = 2.4
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2)), new Vec3(0, wheelY + height / 2, 0)],
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        spoiler: Mesh
        ["wheel-back"]: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

interface SedanSportsProps {
    children?: ReactNode
    position?: Tuple3
    rotation?: Tuple3
}

function SedanSports({ position, rotation }: SedanSportsProps, ref: ForwardedRef<RigidVehicle>) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [chassisRef, wheelsRef, vehicle] = useRigidVehicle({
        rotation,
        position,
        wheels,
        chassis,
        mass: 7
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
                    geometry={nodes.spoiler.geometry}
                    position={[0, .45, -1.044]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                    />
                </mesh>
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
            </group>
            <group
                dispose={null}
                ref={wheelsRef}
            >
                {Array.from({ length: 4 }).map((i, index) => {
                    return (
                        <mesh
                            castShadow
                            key={index}
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

export default memo(forwardRef(SedanSports))

useGLTF.preload(model)
