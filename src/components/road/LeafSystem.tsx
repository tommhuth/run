import { setMatrixAt, setMatrixNullAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { LEAF_MAX_COUNT, removeLeaves } from "@data/store/actions/leaves"
import { store } from "@data/store/store"
import { ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { BufferGeometry, Float32BufferAttribute, InstancedMesh } from "three"

const geometry = new BufferGeometry()
// diamond ish shape
const positions = new Float32BufferAttribute([
    0, 0.09, 0,
    -0.06, 0, 0,
    0, -0.09, 0,
    0.06, 0, 0,
], 3)

geometry.setAttribute("position", positions)
geometry.setIndex([0, 1, 3, 1, 2, 3])
geometry.computeVertexNormals()

const GRAVITY = 3

export default function LeafSystem() {
    const ref = useRef<InstancedMesh>(null)

    useEffect(() => {
        if (!ref.current) return

        for (let i = 0; i < LEAF_MAX_COUNT; i++) {
            setMatrixNullAt(ref.current, i)
        }
    }, [])

    useFrame((_, delta) => {
        const { leaves } = store.getState()

        if (!ref.current || leaves.length === 0) {
            return
        }

        const nd = ndelta(delta)
        const toRemove: string[] = []

        const damping = Math.pow(0.98, nd * 60)

        for (const leaf of leaves) {
            // Gravity pulls down
            leaf.velocity[1] -= GRAVITY * nd

            // Oscillation for leaf-like flutter
            leaf.time += nd * 6
            const oscillateX = Math.sin(leaf.time) * 2
            const oscillateZ = Math.cos(leaf.time * 0.7) * 2

            // Apply velocity with oscillation
            leaf.position[0] += (leaf.velocity[0] + oscillateX) * nd
            leaf.position[1] += leaf.velocity[1] * nd
            leaf.position[2] += (leaf.velocity[2] + oscillateZ) * nd

            // Dampen horizontal velocity
            leaf.velocity[0] *= damping
            leaf.velocity[2] *= damping

            if (leaf.position[1] <= 0) {
                leaf.position[1] = 0
                toRemove.push(leaf.id)

                continue
            }

            setMatrixAt({
                instance: ref.current,
                index: leaf.index,
                position: leaf.position,
                rotation: [leaf.time * 0.5, leaf.time * 0.3, leaf.time * 0.7],
                scale: leaf.scale,
            })
        }

        if (toRemove.length > 0) {
            removeLeaves(toRemove)
        }
    })

    return (
        <instancedMesh
            ref={ref}
            args={[geometry, leafMaterial, LEAF_MAX_COUNT]}
            frustumCulled={false}
        />
    )
}
