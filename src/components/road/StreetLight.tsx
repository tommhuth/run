import { useInstance } from "@components/InstancedMesh"
import { ShapeDefinition, useInstancedBody } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { useEffect } from "react"

const height = 4.1
const width = .75

const box: ShapeDefinition = [
    [new Box(new Vec3(.15, height / 2, .15)), new Vec3(0, 0, 0)],
    [new Box(new Vec3(.15, .1, width)), new Vec3(0, height / 2 - .1, -width / 2 - .25)],
]
const boxBig: ShapeDefinition = [
    [new Box(new Vec3(.2, height / 2, .3)), new Vec3(0, 0, 0)]
]

interface StreetLightProps {
    position: Tuple3
    fixed?: boolean
    rotation: Tuple3
}

const _impulse = new Vec3()

export default function StreetLight({
    position,
    fixed = false,
    rotation
}: StreetLightProps) {
    const [active, setActive] = useTransitionedState(false)
    const [collisionResponse, setCollisionResponse] = useTransitionedState(fixed)
    const y = position[1] + height / 2
    const [index, instance] = useInstance(fixed || !collisionResponse ? "streetlightStatic" : "streetlightDynamic", {
        rotation,
        position: [position[0], y, position[2]],
        keepAround: true
    })
    const [body] = useInstancedBody({
        mass: collisionResponse && !fixed ? 1 : 0,
        collisionResponse,
        position: [position[0], y, position[2]],
        rotation,
        active,
        index,
        userData: { type: "streetlight" },
        instance,
        keepAround: false,
        definition: collisionResponse || fixed ? box : boxBig
    })

    useEffect(() => {
        if (collisionResponse || !body || fixed) {
            return
        }

        const onCollide = () => {
            setCollisionResponse(true)
        }

        body.addEventListener("collide", onCollide)

        return () => {
            body.removeEventListener("collide", onCollide)
        }
    }, [body, fixed, collisionResponse])

    useEffect(() => {
        if (body && collisionResponse && !fixed) {
            const player = store.getState().player.vehicle

            if (player) {
                _impulse.copy(player.chassisBody.velocity).unit()
                _impulse.scale(25)
                //body.applyImpulse(_impulse)
            }
        }
    }, [body, fixed, collisionResponse])

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

    return null
} 
