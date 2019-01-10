import { MeshBuilder, ArcRotateCamera } from "babylonjs"   

const INIT_ALPHA =  -Math.PI / 4 
const INIT_BETA = 0 //Math.PI / 3.5
const INIT_RADIUS = 0

const START_ALPHA =  -Math.PI / 2 
const START_BETA = .9 //Math.PI / 3.5
const START_RADIUS = 15

const RUNNING_ALPHA =  -Math.PI / 2 
const RUNNING_BETA = Math.PI / 3.5 //-- UP/DOWN
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
    }
    running() {
        this.mode = "running" 
        this.alpha = RUNNING_ALPHA
        this.beta = RUNNING_BETA
        this.radius = RUNNING_RADIUS
    }
    gameOver() {  
        this.lastZ = this.player.position.z + 7
        this.radius = GAME_OVER_RADIUS
    }
    reset() { 
        this.target.position.set(0, 0, 6)
        this.running()
    }
    beforeRender(player, pathway) { 
        // empty
    }
}
