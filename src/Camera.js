import { MeshBuilder, ArcRotateCamera } from "babylonjs"  
import uuid from "uuid" 

export default class Camera extends ArcRotateCamera {
    gameOver = false 
    lastZ = 0

    constructor(scene, player) {  
        const startAlpha = -Math.PI / 2 //Math.PI / 2 // LEFT RIGHT
        const startBeta =  Math.PI / 3.5 //1.55 /// UP DOWN
        const startRadius = 13 
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

        this.player.on("gameover", () => {
            this.gameOver = true
            this.lastZ = this.player.position.z + 8
        })
        this.player.on("reset", () => {
            this.gameOver = false
        })
    }
    beforeRender() { 
        if (this.gameOver) {
            this.target2.position.z += (this.lastZ - this.target2.position.z) / 90
            this.target2.position.x += (0 - this.target2.position.x ) / 60
        } else {
            this.target2.position.z = this.player.position.z + 3
            this.target2.position.x += (this.player.rotation / 15 - this.target2.position.x ) / 60
        }
    }
}
