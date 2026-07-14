import rockModel from "@assets/models/rock.glb"
import streetLightModels from "@assets/models/streetlight.glb"
import treesModels from "@assets/models/trees.glb"
import { InstanceName } from "@data/store/actions/actions"
import { useStore } from "@data/store/store"
import { useGLTF } from "@react-three/drei"
import { Layers } from "three"

import { useExternalModel } from "./ExternalModel"
import InstancedMesh from "./InstancedMesh"
import { carMaterial } from "./materials/shared"

for (const model of [streetLightModels, rockModel, treesModels]) {
    useGLTF.preload(model)
}

export const AO_LAYER = 2

export const aoLayers = new Layers()

aoLayers.set(AO_LAYER)

export function Instances() {
    const rock = useExternalModel(rockModel, "rock")
    const trees = useExternalModel(treesModels)
    const streetLights = useExternalModel(streetLightModels)
    const treeMataterial = useStore(i => i.materials.tree)
    const rockMaterial = useStore(i => i.materials.rock)

    return (
        <>
            <InstancedMesh
                name="rock"
                geometry={rock.geometry}
                material={rockMaterial}
                count={40}
                castShadow
                layers={aoLayers}
                receiveShadow
            />
            {Object.entries(streetLights).map(([name, { geometry }]) => (
                <InstancedMesh
                    key={name}
                    name={name as InstanceName}
                    geometry={geometry}
                    material={carMaterial}
                    count={20}
                    layers={aoLayers}
                    castShadow
                    receiveShadow
                />
            ))}
            {Object.entries(trees).map(([name, { geometry }]) => {
                return (
                    <InstancedMesh
                        name={name as InstanceName}
                        key={name}
                        geometry={geometry}
                        material={treeMataterial}
                        layers={aoLayers}
                        count={20}
                        castShadow
                        receiveShadow
                    />
                )
            })}
        </>
    )
}
