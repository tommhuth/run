 
import { MeshBuilder } from "babylonjs"  
import uuid from "uuid"

export default class World {
    width = 40
    height = 60 

    constructor(scene) {
        const mesh = MeshBuilder.CreateGround(uuid.v4(), { width: this.width, height: this.height }, scene)
        
        mesh.position.set(0, -6, 20) 
        mesh.visibility = .25

        this.group = mesh
    }
 
    beforeRender(pathway, player) {   
        this.group.position.z = player.position.z + this.height/2
    }
}  
