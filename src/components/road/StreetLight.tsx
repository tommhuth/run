import { useInstance } from "@components/InstancedMesh"
import { bulbMaterial } from "@components/materials/shared"
import { ShapeDefinition, useInstancedBody } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { useEffect } from "react"
import { SphereGeometry } from "three"

const height = 4.1
const width = .75

const bulbGeometry = new SphereGeometry(1, 16, 16)

const box: ShapeDefinition = [
    [new Box(new Vec3(.15, height / 2, .15)), new Vec3(0, 0, 0)],
    [new Box(new Vec3(.15, .1, width)), new Vec3(0, height / 2 - .1, -width / 2 - .25)],
]
const boxBig: ShapeDefinition = [
    [new Box(new Vec3(.2, height / 2, .3)), new Vec3(0, 0, 0)]
]

interface StreetLightProps {
    position: Tuple3
    rotation: Tuple3
}

export default function StreetLight({
    position,
    rotation
}: StreetLightProps) {
    const [active, setActive] = useTransitionedState(false)
    const [collisionResponse, setCollisionResponse] = useTransitionedState(false)
    const y = position[1] + height / 2
    const [index, instance] = useInstance(!collisionResponse ? "streetlightStatic" : "streetlightDynamic", {
        rotation,
        position: [position[0], y, position[2]],
        keepAround: true
    })
    const [body] = useInstancedBody({
        mass: collisionResponse ? 1 : 0,
        collisionResponse,
        position: [position[0], y, position[2]],
        rotation,
        active,
        index,
        userData: { type: "streetlight" },
        instance,
        keepAround: false,
        definition: collisionResponse ? box : boxBig
    })

    useEffect(() => {
        if (collisionResponse || !body) {
            return
        }

        const onCollide = () => {
            setCollisionResponse(true)
        }

        body.addEventListener("collide", onCollide)

        return () => {
            body.removeEventListener("collide", onCollide)
        }
    }, [body, collisionResponse])

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        const triggerThreshold = 20
        const currentActive = vehicle.chassisBody.position.z > z - triggerThreshold

        if (active !== currentActive) {
            setActive(currentActive)
        }
    })

    return (
        <group
            position={[position[0], y, position[2]]}
            rotation={rotation}
        >
            <mesh
                geometry={bulbGeometry}
                material={bulbMaterial}
                scale={[.125, .1, .25]}
                position={[0, height / 2 - .15, -width - .25]}
            />
        </group>
    )
}
