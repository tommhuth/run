import { SceneLoader, Vector3 } from "babylonjs"   

const models = {}

function clone(model) {
    let instance = models[model].createInstance()

    instance.width = models[model].width
    instance.height = models[model].height
    instance.depth = models[model].depth

    return instance
}

function load() {  
    return SceneLoader.LoadAssetContainerAsync("world.babylon")  
        .then(({ meshes }) => { 
            for (let mesh of meshes) { 
                let { extendSize } = mesh.getBoundingInfo().boundingBox

                mesh.width = extendSize.x  * 2
                mesh.height = extendSize.y * 2
                mesh.depth = extendSize.z * 2
                //mesh.material = baseMaterial
                mesh.convertToFlatShadedMesh() 
                mesh.receiveShadows = true 
                mesh.position = new Vector3(0, -100, 0)
                mesh.isVisible = false

                /*
                switch (mesh.id) {
                    case "plant":
                    case "leaf":
                        mesh.material = plantMaterial
                        break 
                    case "logo":
                        mesh.material = blackMaterial
                        break
                    case "coin":
                        mesh.material = blackMaterial
                        break
                    default:
                        mesh.material = baseMaterial
                }
                */
                models[mesh.id] = mesh
            }  
        })
        .catch(_e => {
            console.error(e)
        })
}

export { load, clone, models }
