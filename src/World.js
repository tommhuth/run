 
import { MeshBuilder, StandardMaterial, Color3, Mesh } from "babylonjs"  
import uuid from "uuid"
import { makeGroup } from "./utils/utils"

export default class World {
    width = 45
    height = 60 
    fogLayers = 8
    scene
    group

    constructor(scene) { 
        this.scene = scene
        this.group = makeGroup(scene)
        this.group.position.set(0, -4.75, 0) 
        this.makeFog()
    }
    makeFog(){
        let fogMaterial = new StandardMaterial(this.scene)  
        let wrap = MeshBuilder.CreateBox("", { size: 70, sideOrientation: Mesh.BACKSIDE }, this.scene)
  
        fogMaterial.emissiveColor = Color3.White()
        fogMaterial.disableLighting = true

        wrap.material = fogMaterial 
        wrap.position.set(0,0,0)
        wrap.parent = this.group
        
        for (let i = 0; i < this.fogLayers; i++) {
            const mesh = MeshBuilder.CreateGround(uuid.v4(), { width: this.width, height: this.height }, this.scene)
        
            mesh.visibility = .35 * i / this.fogLayers + .2
            mesh.position.y = -i * .2
            mesh.material = fogMaterial
            mesh.parent = this.group
        }
    }
 
    beforeRender(pathway, player) {   
        this.group.position.z = player.position.z 
    }
}  
