import { SceneLoader, Vector3, MeshBuilder, StandardMaterial, PhysicsImpostor as Impostor } from "babylonjs"   
import materials from "../materials"
import { makeGroup } from "./utils"

const models = {}

function clone(model) {
    let instance = models[model].createInstance()

    instance.width = models[model].width
    instance.height = models[model].height
    instance.depth = models[model].depth

    return instance
}

export function box(scene, { width = 1, height = 1, depth = 1 } = {}) {
    let box = MeshBuilder.CreateBox(scene, { width, height, depth }, scene) 
    
    box.isVisible = false
    //box.visibility = .5

    return box
}

export function boxed(scene, width = 1, height = 1, depth = 1, impostor = true) {
    let group = makeGroup(scene)

    if (impostor) {
        let tmp = box(scene, { width, height, depth})

        tmp.position.set(width/2 -.5, 0, depth/2 - .5)
        tmp.physicsImpostor = new Impostor(tmp, Impostor.BoxImpostor, { mass: 0 }, scene) 
        tmp.parent = group
        group.tmp = tmp
    }

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < depth ; j++) { 
            for (let k = 0; k < height; k++) {
                let cube = clone("cube")

                cube.scaling.set(.5, .5, .5)
                cube.position.set(i, -k, j)
                cube.parent = group
            } 
        }
    }

    return group 
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
