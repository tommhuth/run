import { SceneLoader, Vector3 } from "babylonjs"   
import materials from "../materials"

const models = {}

function clone(model) {
    let instance = models[model].createInstance()

    instance.width = models[model].width
    instance.height = models[model].height
    instance.depth = models[model].depth

    return instance
}

async function load() {  
    try {
        let { meshes } = await SceneLoader.LoadAssetContainerAsync("world.babylon")  
         
        for (let mesh of meshes) { 
            let { extendSize } = mesh.getBoundingInfo().boundingBox
    
            mesh.width = extendSize.x  * 2
            mesh.height = extendSize.y * 2
            mesh.depth = extendSize.z * 2 
            mesh.convertToFlatShadedMesh() 
            mesh.receiveShadows = true 
            mesh.position = new Vector3(0, 0, 0)
            mesh.isVisible = false
            
            switch (mesh.id) {
                case "plant":
                case "leaf":
                case "leaves2":
                case "leaves":
                    mesh.material = materials.greenery
                    break 
                case "logo":
                    mesh.material = materials.rock
                    break
                case "coin":
                    mesh.material = materials.powerup
                    break
                default:
                    mesh.material = materials.rock
            }
            
            models[mesh.id] = mesh
        } 
    } catch(e) {
        console.error(e)
    }
}

export { load, clone, models }
