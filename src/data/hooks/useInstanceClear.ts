import { setMatrixNullAt } from "@components/materials/helpers"
import { useLayoutEffect } from "react"
import { InstancedMesh } from "three"

export function useInstanceClear(instance: InstancedMesh | null, count: number) {
    useLayoutEffect(() => {
        if (!instance) {
            return
        }

        for (let i = 0; i < count; i++) {
            setMatrixNullAt(instance, i)
        }
    }, [instance, count])
}
