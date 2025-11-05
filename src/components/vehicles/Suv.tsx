import model from "@assets/models/suv.glb"
import Config from "@data/Config"
import { Chassis, useRigidVehicle, Wheel } from "@data/useRigidVehicle"
import { useGLTF } from "@react-three/drei"
import { Box, Vec3 } from "cannon-es"
import { forwardRef, useImperativeHandle } from "react"
import { Mesh, MeshStandardMaterial } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

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
    materials: {
        colormap: MeshStandardMaterial
    }
}

const Suv = forwardRef(function Suv({ children, ...props }, ref) {
    let { nodes, materials } = useGLTF(model) as unknown as GLTFResult
    let [chassisRef, wheelsRef, vehicle] = useRigidVehicle({
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
            <group ref={chassisRef}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.body.geometry}
                    position={[0, 0.2, 0]}
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
                    geometry={nodes["wheel-back"].geometry}
                    position={[0, 0.5, -1.05]}
                >
                    <primitive
                        attach="material"
                        object={materials.colormap}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
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
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes["wheel-back-left"].geometry}
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
                >
                    <primitive
                        attach="material"
                        object={materials.colormap}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
            </group >
        </>
    )
})

export default Suv
