import { ReactElement, ReactNode, cloneElement, memo, startTransition, useCallback, useMemo } from "react"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"
import { MaterialName, setMaterial, store } from "@data/store"
import { CloudMaterial } from "./Cloud"

function MaterialLoader() {
    let materials = useMemo(() => {
        return {
            // cloud: <CloudMaterial />,
        } satisfies Record<MaterialName, ReactNode>
    }, [])

    return Object.entries(materials).map(([name, material]) => {
        return (
            <MaterialHandler
                name={name as MaterialName}
                key={name}
            >
                {material}
            </MaterialHandler>
        )
    })
}

let geometry = new BoxGeometry()

function MaterialHandler({ children, name }: { children: ReactNode; name: MaterialName }) {
    let handleRef = useCallback((mesh: Mesh<BufferGeometry, Material>) => {
        let existing = store.getState().materials[name]

        if (mesh && existing !== mesh.material) {
            startTransition(() => setMaterial(name, mesh.material))
        }
    }, [name])

    return (
        <mesh
            geometry={geometry}
            ref={handleRef}
            dispose={null}
            frustumCulled={false}
            position-z={1}
        >
            {cloneElement(children as ReactElement, { name })}
        </mesh>
    )
}

export default memo(MaterialLoader)