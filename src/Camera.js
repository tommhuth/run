import { MeshBuilder, ArcRotateCamera } from "babylonjs"  
import uuid from "uuid" 

export default class Camera extends ArcRotateCamera {
    constructor(scene, player) {  
        const startAlpha = -Math.PI / 2 //Math.PI / 2 // LEFT RIGHT
        const startBeta =  Math.PI / 3.5 //1.55 /// UP DOWN
        const startRadius = 12 
        const target = MeshBuilder.CreateBox(uuid.v4(), { size: .1 }, scene)

        target.isVisible = false 
        target.position.z = 0
        target.position.y = 0

        super(uuid.v4(), startAlpha, startBeta, startRadius, target, scene)  
        this.player = player
        this.scene = scene 
        this.target2 = target
        this.maxZ = 75
        this.minZ = -15
    }
    beforeRender() { 
        this.target2.position.z = this.player.position.z
    }
}
