import { MeshBuilder, ArcRotateCamera } from "babylonjs"   

const INIT_ALPHA =  -Math.PI / 4 
const INIT_BETA = 0 //Math.PI / 3.5
const INIT_RADIUS = 0

const START_ALPHA =  -Math.PI / 2 
const START_BETA = .9 //Math.PI / 3.5
const START_RADIUS = 15

const RUNNING_ALPHA =  -Math.PI / 2 
const RUNNING_BETA = Math.PI / 3.5
const RUNNING_RADIUS = 12
 
const GAME_OVER_RADIUS = 18

export default class Camera {
    lastZ = 0
    alpha = START_ALPHA
    beta = START_BETA
    radius = START_RADIUS
    mode = "init"  

    constructor(scene, player) {
        const target = MeshBuilder.CreateBox(null, { size: .1 }, scene)
        const camera = new ArcRotateCamera(null, INIT_ALPHA, INIT_BETA, INIT_RADIUS, target, scene)

        camera.maxZ = 75
        camera.minZ = -15

        target.isVisible = false 
        target.position.z = -12
        target.position.y = 0
 
        this.player = player
        this.scene = scene 
        this.target = target
        this.camera = camera

        this.player.on("gameover", () => {
            this.mode = "gameover"
            this.lastZ = this.player.position.z + 7
            this.gameOver()
        })
        this.player.on("reset", () => {
            this.target.position.set(0, 0, 6)
            this.running()
        })
    }
    running(){
        this.mode = "running" 
        this.alpha = RUNNING_ALPHA
        this.beta = RUNNING_BETA
        this.radius = RUNNING_RADIUS
    }
    gameOver() {  
        this.radius = GAME_OVER_RADIUS
    }
    beforeRender() { 
        switch(this.mode) {
            case "running":
                this.target.position.z += (this.player.position.z + 6 - this.target.position.z) / 32
                this.target.position.x += (this.player.rotation / 15 - this.target.position.x ) / 60
                this.target.position.y += (this.player.position.y - this.target.position.y) / 60
                break
            case "gameover": 
                this.target.position.z += (this.lastZ - this.target.position.z) / 32 
                break
            case "init": 
                this.target.position.z += (2 - this.target.position.z) / 120
                this.target.position.y += (-2 - this.target.position.y) / 120
                break
        } 

        this.camera.radius += (this.radius - this.camera.radius) / 90
        this.camera.alpha += (this.alpha - this.camera.alpha) / 60
        this.camera.beta += (this.beta - this.camera.beta) / 60
    }
}
