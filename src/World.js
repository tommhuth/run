 
import { MeshBuilder } from "babylonjs"  
import uuid from "uuid"

export default class World {
    constructor(scene) {
        const mesh = MeshBuilder.CreateGround(uuid.v4(), { width: 40, height: 40 }, scene)
        
        mesh.position.set(0, -6, 0) 
        mesh.visibility = .25

        this.group = mesh
    }
 
    beforeRender(pathway, player) {   
        this.group.position.z = player.position.z
    }
}  
