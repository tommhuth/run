import CloudMaterial from "@components/materials/CloudMaterial"
import { useStore } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { MeshBasicMaterial } from "three"

import Cloud from "./Cloud"

export default function CloudSystem() {
    const [material, setMaterial] = useTransitionedState<MeshBasicMaterial | null>(null)
    const clouds = useStore(i => i.clouds)

    return (
        <>
            <CloudMaterial ref={setMaterial} />

            {material && clouds.map((cloud) => {
                return (
                    <Cloud
                        material={material}
                        key={cloud.id}
                        {...cloud}
                    />
                )
            })}
        </>
    )
}
