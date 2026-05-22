import { useTransitionedState } from "@data/hooks/utils"
import { InstanceName, setInstance } from "@data/store/actions/actions"
import { store, useStore } from "@data/store/store"
import { Tuple3, Tuple4 } from "@src/types/global"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { BufferGeometry, ColorRepresentation, InstancedMesh as InstancedMeshThree, Material } from "three"

import { setColorAt, setMatrixAt, setMatrixNullAt } from "./materials/helpers"

interface UseInstanceOptions {
    clear?: boolean
    color?: ColorRepresentation
    scale?: number | Tuple3
    rotation?: Tuple3 | Tuple4
    position?: Tuple3
}

export function useInstance(name: InstanceName, {
    clear = true,
    color,
    scale,
    rotation = [0, 0, 0],
    position = [0, 0, 0],
}: UseInstanceOptions = {}) {
    const instance = useStore(i => i.instances[name])
    const [index, setIndex] = useTransitionedState<null | number>(null)

    useEffect(() => {
        if (instance) {
            setIndex(instance.index.next())
        }
    }, [instance])

    useEffect(() => {
        if (typeof index === "number" && instance) {
            setMatrixAt({
                instance: instance.mesh,
                index,
                position,
                scale,
                rotation,
            })
        }
    }, [index, ...rotation, ...position, ...(Array.isArray(scale) ? scale : [scale]), instance])

    useEffect(() => {
        if (typeof index === "number" && instance && clear) {
            return () => {
                setMatrixNullAt(instance.mesh, index as number)
            }
        }
    }, [index, instance, clear])

    useEffect(() => {
        if (instance && typeof index === "number" && color) {
            setColorAt(instance.mesh, index, color)
        }
    }, [index, color, instance])

    return [index, instance?.mesh] as const
}

interface InstancedMeshProps {
    children?: ReactNode
    receiveShadow?: boolean
    castShadow?: boolean
    colors?: boolean
    visible?: boolean
    count: number
    name: InstanceName
    renderOrder?: number
    geometry?: BufferGeometry
    material?: Material
}

export default function InstancedMesh({
    children,
    receiveShadow = false,
    castShadow = false,
    colors = false,
    visible = true,
    count,
    name,
    renderOrder,
    geometry,
    material
}: InstancedMeshProps) {
    const colorData = useMemo(() => {
        return new Float32Array(colors ? count * 3 : 0).fill(0)
    }, [count])
    const [instance, setInstanceRef] = useState<InstancedMeshThree | null>(null)
    const attempts = 0

    useEffect(() => {
        if (!instance) {
            return
        }

        for (let i = 0; i < count; i++) {
            setMatrixNullAt(instance, i)
        }
    }, [attempts, count, instance])

    useEffect(() => {
        if (!instance || store.getState().instances[name]?.mesh === instance) {
            return
        }

        setInstance(name, instance, count)
    }, [count, instance, name])

    return (
        <instancedMesh
            args={[geometry, material, count]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            ref={setInstanceRef}
            visible={visible}
            frustumCulled={false}
            renderOrder={renderOrder}
        >
            {colors && (
                <instancedBufferAttribute
                    attach="instanceColor"
                    args={[colorData, 3, false]}
                />
            )}
            {children}
        </instancedMesh>
    )
}
