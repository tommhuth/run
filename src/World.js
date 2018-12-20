 
import { MeshBuilder, StandardMaterial, Color3, Mesh } from "babylonjs"  
import uuid from "uuid"
import { makeGroup } from "./utils/utils"
import { Config } from "./pathway/Pathway"

export default class World {
    width = 45
    height = 60 
    fogLayers = 8
    scene
    group

    constructor(scene) { 
        this.scene = scene
        this.group = makeGroup(scene)
        this.group.position.set(0, -Config.FLOOR_DEPTH, 0) 
        this.makeFog()
    }
    makeFog(){
        let fogMaterial = new StandardMaterial(this.scene)  
        let wrap = MeshBuilder.CreateBox("", { size: 70, sideOrientation: Mesh.BACKSIDE }, this.scene)
        let fogLayer = MeshBuilder.CreateGround(uuid.v4(), { width: this.width, height: this.height }, this.scene)
        let isSmallScreen = matchMedia("(max-width: 900px)").matches
  
        fogMaterial.diffuseColor = new Color3(.4,.4,.4)

        fogLayer.material = fogMaterial
        fogLayer.position.y = -20
        fogLayer.receiveShadows = true 

        wrap.material = fogMaterial 
        wrap.position.set(0,0,0)
        wrap.parent = this.group
         
        for (let i = 0; i <  (isSmallScreen ? this.fogLayers : 1) ; i++) {
            const mesh = fogLayer.clone()
        
            mesh.visibility = isSmallScreen ?  .9735 * i / this.fogLayers + .2 : 1
            mesh.position.y = -i * .2
            mesh.parent = this.group
            mesh.receiveShadows = i < 6   ? true : false 
        }
    }
 
    beforeRender(pathway, player) {   
        this.group.position.z = player.position.z 
    }
}  
