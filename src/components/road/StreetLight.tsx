import { useInstance } from "@components/InstancedMesh"
import { ShapeDefinition, useInstancedBody } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"
import { useEffect } from "react"

const height = 4.1
const width = .75

const box: ShapeDefinition = [
    [new Box(new Vec3(.05, height / 2, .1)), new Vec3(0, 0, 0)],
    [new Box(new Vec3(.1, .1, width)), new Vec3(0, height / 2 - .1, -width / 2 - .25)],
]
const boxBig: ShapeDefinition = [
    [new Box(new Vec3(.2, height / 2, .3)), new Vec3(0, 0, 0)]
]

export default function StreetLight({
    position,
    rotation
}) {
    const [active, setActive] = useTransitionedState(false)
    const [collisionResponse, setCollisionResponse] = useTransitionedState(false)
    const y = position[1] + height / 2
    const [index, instance] = useInstance("streetLight", {
        rotation,
        position: [position[0], y, position[2]],
        clear: true
    })
    const [body] = useInstancedBody({
        mass: collisionResponse ? 1 : 0,
        collisionResponse,
        position: [position[0], y, position[2]],
        rotation,
        active,
        index,
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

    useEffect(() => {
        if (body && collisionResponse) {
            const player = store.getState().player.vehicle

            if (player) {
                body.applyForce(player.chassisBody.velocity.clone().scale(4))
            }
        }
    }, [body, collisionResponse])

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        const dist = 10
        const currentActive = vehicle.chassisBody.position.z > z - dist

        if (active !== currentActive) {
            setActive(currentActive)
        }
    })

    return null
} 
