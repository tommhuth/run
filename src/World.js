 
import { MeshBuilder, Mesh } from "babylonjs" 
import { makeGroup } from "./utils/utils"
import { Config } from "./pathway/Pathway"
import materials from "./materials"

export default class World {
    width = 45
    height = 60 
    fogLayers = 8
    scene
    group 
    
    get position() {
        return this.group.position
    }
    constructor(scene) { 
        this.scene = scene
        this.group = makeGroup(scene)
        this.group.position.set(0, -Config.FLOOR_DEPTH, 0) 

        this.makeFog()  
    }  
    makeFog(){ 
        let wrap = MeshBuilder.CreateBox(null, { size: 70, sideOrientation: Mesh.BACKSIDE }, this.scene)
        let fogLayer = MeshBuilder.CreateGround(null, { width: this.width, height: this.height }, this.scene)
   
        fogLayer.material = materials.water
        fogLayer.position.y = -20
        fogLayer.receiveShadows = true 

        wrap.material = materials.water 
        wrap.position.set(0,0,0)
        wrap.parent = this.group
         
        for (let i = 0; i <  this.fogLayers;  i++) {
            const mesh = fogLayer.clone()
        
            mesh.visibility =   .9735 * i / this.fogLayers + .2
            mesh.position.y = -i * .2
            mesh.parent = this.group
            mesh.receiveShadows = i < 6   ? true : false 
        }
    }
 
    beforeRender(pathway, player) {   
        this.position.z = player.position.z 
    }
}  
