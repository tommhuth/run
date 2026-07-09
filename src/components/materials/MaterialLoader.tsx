import { MaterialName, setMaterial } from "@data/store/actions/actions"
import { store } from "@data/store/store"
import { cloneElement, memo, ReactElement, ReactNode, startTransition, useCallback, useMemo } from "react"
import { BoxGeometry, BufferGeometry, Material, Mesh } from "three"

import RoadMaterial from "./RoadMaterial"
import RockMaterial from "./RockMaterial"
import TreeMaterial from "./TreeMaterial"

function MaterialLoader() {
    const materials = useMemo(() => {
        return {
            road: <RoadMaterial />,
            tree: <TreeMaterial />,
            rock: <RockMaterial />,
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

const geometry = new BoxGeometry()

function MaterialHandler({ children, name }: { children: React.ReactNode; name: MaterialName }) {
    const handleRef = useCallback((mesh: Mesh<BufferGeometry, Material>) => {
        const existing = store.getState().materials[name]

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
        >
            {cloneElement(children as ReactElement)}
        </mesh>
    )
}

export default memo(MaterialLoader)
