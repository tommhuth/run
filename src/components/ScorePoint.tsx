import { store } from "@data/store"
import { clamp, setMatrixAt, setMatrixNullAt } from "@data/utils"
import random from "@huth/random"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2, Tuple3 } from "@src/types/global"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Camera, InstancedMesh, Vector3 } from "three"

const _ndc = new Vector3()
const _cameraPosition = new Vector3()

function screenToWorld(
    [x, y]: Tuple2,
    camera: Camera,
    distanceFromCamera = 5
) {
    _ndc.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5 // halfway between near/far clip
    )

    _ndc.unproject(camera)

    const direction = _ndc.sub(camera.position)
        .normalize()

    return _cameraPosition.copy(camera.position)
        .add(direction.multiplyScalar(distanceFromCamera))
}

interface Point {
    position: Tuple3
    scale: number
    id: string
    duration: number
}

const _position = new Vector3()

export default function ScorePoint() {
    const count = 30
    const ref = useRef<InstancedMesh>(null)
    const i = useRef(0)
    const [points, setPoints] = useState<Point[]>([])
    const { camera } = useThree()

    useEffect(() => {
        const click = () => {
            const { player: { mesh } } = store.getState()

            if (!mesh) {
                return
            }

            i.current = 0
            setPoints(Array.from({ length: count }).fill(null).map(() => {
                return {
                    id: random.id(),
                    position: [
                        mesh.position.x + random.float(-.5, .5),
                        mesh.position.y + random.float(-.5, .5),
                        mesh.position.z + random.float(0, 1),
                    ],
                    duration: random.float(600, 1000),
                    scale: random.float(.015, .05)
                }
            }))
        }

        window.addEventListener("click", click)

        return () => {
            window.removeEventListener("click", click)
        }
    }, [camera])

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }

        for (let i = 0; i < count; i++) {
            setMatrixNullAt(ref.current, i)
        }
    }, [])

    useFrame(({ camera }, delta) => {
        if (!ref.current) {
            return
        }

        const target = screenToWorld([100, window.innerHeight - 100], camera, 2)

        for (const [index, { position, scale, duration }] of points.entries()) {
            const alpha = clamp(i.current / duration, 0, 1)

            if (alpha === 1) {
                setMatrixNullAt(ref.current, index)
            } else {
                _position.set(...position)
                _position.lerp(target, alpha)

                setMatrixAt({
                    index,
                    instance: ref.current,
                    scale,
                    position: _position.toArray()
                })
            }
        }

        i.current += delta * 1000
    })

    return (
        <instancedMesh
            frustumCulled={false}
            ref={ref}
            args={[undefined, undefined, count]}
            castShadow
            receiveShadow
        >
            <meshPhongMaterial shininess={100} color="red" />
            <sphereGeometry args={[1, 16, 16]} />
        </instancedMesh>
    )
}
