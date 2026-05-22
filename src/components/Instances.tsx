import streetLightModel from "@assets/models/light-curved.glb"
import rockModel from "@assets/models/rock.glb"
import treesModels from "@assets/models/trees.glb"
import { InstanceName } from "@data/store/actions/actions"
import { useGLTF } from "@react-three/drei"

import { useExternalModel } from "./ExternalModel"
import InstancedMesh from "./InstancedMesh"
import { rockMaterial, streetLightMaterial, treeMaterial } from "./materials/shared"

for (const model of [streetLightModel, rockModel, treesModels]) {
    useGLTF.preload(model)
}

export function Instances() {
    const rock = useExternalModel(rockModel, "rock")
    const trees = useExternalModel(treesModels)
    const streetLight = useExternalModel(streetLightModel, "light-curved")

    return (
        <>
            <InstancedMesh
                name="rock"
                geometry={rock.geometry}
                material={rockMaterial}
                count={40}
                castShadow
                receiveShadow
            />
            <InstancedMesh
                name="streetLight"
                geometry={streetLight.geometry}
                material={streetLightMaterial}
                count={20}
                castShadow
                receiveShadow
            />
            {Object.entries(trees).map(([name, { geometry }]) => {
                return (
                    <InstancedMesh
                        name={name as InstanceName}
                        key={name}
                        geometry={geometry}
                        material={treeMaterial}
                        count={20}
                        castShadow
                        receiveShadow
                    />
                )
            })}
        </>
    )
}
