import { setMatrixAt } from "@components/materials/helpers"
import { store } from "@data/store"
import { clamp } from "@data/utils"
import random from "@huth/random"
import { config, SpringValue } from "@react-spring/core"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { InstancedMesh, Vector3 } from "three"

interface Particle {
    position: Vector3
    velocity: Vector3
    id: string
    scale: Tuple3
}

const speed = new SpringValue(0, { config: config.molasses })

export default function SpeedParticles() {
    const count = 35
    const ref = useRef<InstancedMesh>(null)
    const particles = useMemo(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            return {
                id: random.id(),
                position: new Vector3(
                    random.float(1, 8) * random.pick(-1, 1),
                    random.float(-4, 4),
                    random.float(2, 25),
                ),
                scale: [random.float(.01, .02), .01, random.float(.25, .85)],
                velocity: new Vector3(
                    random.float(-.25, .25),
                    .4,
                    random.float(-.6, -.05),
                )
            } satisfies Particle
        })
    }, [count])

    useFrame(({ camera }, delta) => {
        const { player: { mesh, body }, state } = store.getState()

        if (!ref.current || !mesh || !body) {
            return
        }

        speed.start(state === "running" ? body.velocity.z : 0)

        for (const [index, { position, velocity, scale }] of particles.entries()) {
            const playerScaler = 1 - clamp((camera.position.z - position.z - 0) / 2, 0, 1)
            const speedScale = clamp(speed.get() / 3, 0, 1) ** 2 * 1.5

            setMatrixAt({
                instance: ref.current,
                index,
                rotation: [.1, 0, 0],
                position: position.toArray(),
                scale: [
                    scale[0] * speedScale,
                    scale[1] * speedScale * playerScaler,
                    scale[2] * speedScale
                ]
            })

            position.x += velocity.x * delta
            position.y += (velocity.y) * delta
            position.z += velocity.z * delta - clamp((speed.get() * .25) ** 3, 0, 1.5)

            if (position.z < mesh.position.z || position.y < -4.5) {
                position.z += random.float(25, 30)
                position.y = mesh.position.y + random.float(-4, 4)
                position.x = random.float(1, 8) * random.pick(-1, 1)
            }
        }
    })

    return (
        <instancedMesh
            ref={ref}
            args={[undefined, undefined, count]}
            frustumCulled={false}
        >
            <meshBasicMaterial color="#fff" />
            <sphereGeometry args={[1, 6, 6]} />
        </instancedMesh>
    )
}
