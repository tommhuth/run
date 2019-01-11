import EventLite from "event-lite"
import { Vector3 } from "babylonjs"
import { Config } from "./stage/pathway/Pathway"

export const State = {
    READY: "ready",
    RUNNING: "running",
    GAME_OVER: "game-over"
}

export const RunnerEvent = {
    SCORE_CHANGE: "runner:score-change",
    DISTANCE_CHANGE: "runner:distance-change",
    GAME_OVER: "runner:game-over",
    RESET: "runner:reset"
}

export class RunnerEngine extends EventLite {
    scene
    state = State.READY 
    score = 0 
    distance = 0
    playerVelocities = []
    velocityFramesCount = 3

    constructor(scene, player, pathway, camera, world) {
        super()
        this.scene = scene
        this.player = player
        this.pathway = pathway
        this.camera = camera
        this.world = world

        window.addEventListener("deviceorientation", (e) => this.onDeviceOrientation(e), false)
        window.addEventListener("mousemove", (e) => this.onMouseMove(e), false)
        window.addEventListener("click", (e) => this.onClick(e))
    }

    // handlers
    onDeviceOrientation(e) {
        if (this.state === State.RUNNING) {
            let rotation = e.gamma

            if (e.beta >= 90) {
                // if tilted towards user, gamma is flipped - flip back
                rotation *= -1
            }

            this.player.move(rotation)
        }
    }
    onMouseMove(e) {
        if (this.state === State.RUNNING) {
            this.player.move((e.pageX - window.innerWidth / 2) / 2)
        }
    }
    onClick(e){ 
        e.stopPropagation()
        e.preventDefault()

        switch (this.state) {
            case State.READY: 
                return this.doRunning() 
            case State.RUNNING:  
                return this.doJump()
            case State.GAME_OVER: 
                return this.doReset()
        }   
    }

    // actions
    doJump() { 
        this.player.jump()
    }
    doRunning() { 
        this.state = State.RUNNING
        this.player.start()
        this.camera.running()
    }
    doReset() { 
        this.playerVelocities.length = 0
        this.score = 0
        this.distance = 0
        this.pathway.restart()
        this.camera.reset()
        this.player.start()

        this.emit(RunnerEvent.RESET)
        this.emit(RunnerEvent.SCORE_CHANGE, this.score)
        this.emit(RunnerEvent.DISTANCE_CHANGE, this.distance)

        this.state = State.RUNNING
    }
    doGameOver(reason) {
        this.state = State.GAME_OVER
        this.camera.gameOver()
        this.player.impostor.setLinearVelocity(Vector3.Zero())
        
        this.emit(RunnerEvent.GAME_OVER, { reason })
    }

    // loops
    cameraLoop() {
        let cw = this.camera
        let camera = cw.camera
        let target = cw.target
        let player = this.player 

        switch (this.state) {
            case State.RUNNING:
                target.position.z += (player.position.z + 6 - target.position.z) / 32
                target.position.x += (player.rotation / 15 - target.position.x ) / 60
                target.position.y += (player.position.y - target.position.y) / 60
                break
            case State.GAME_OVER: 
                target.position.z += (cw.lastZ - target.position.z) / 32 
                break
            case State.READY: 
                target.position.z += (2 - target.position.z) / 120
                target.position.y += (-2 - target.position.y) / 120
                break
        } 

        camera.radius += (cw.radius - camera.radius) / 90
        camera.alpha += (cw.alpha - camera.alpha) / 60
        camera.beta += (cw.beta - camera.beta) / 60
    } 
    playerLoop() {
        // player movement/game over
        if (this.state === State.RUNNING) {
            let player = this.player    
            let floorDelimiter = -(Config.FLOOR_DEPTH + 1)
            let velocity = player.impostor.getLinearVelocity().clone() 

            this.playerVelocities.push(velocity.z)
            this.playerVelocities = this.playerVelocities.slice(-this.velocityFramesCount)

            if (this.playerVelocities.length === this.velocityFramesCount) {
                let fallen = player.position.y < floorDelimiter
                let avarageVelocity = this.playerVelocities.map(i => i < 0 ? 0 : i).reduce((total, current) => total + current, 0) / this.velocityFramesCount
                let stopped = avarageVelocity < 2 && player.position.y >= floorDelimiter
             
                if (fallen || stopped) {
                    let reason = fallen ? "fell off" : "crashed"
                    
                    this.doGameOver(reason)
                } 
            }   

            velocity.z = player.speed
            velocity.x = player.rotation
    
            player.impostor.setLinearVelocity(velocity) 
            player.rotation += (player.targetRotation - player.rotation) / 4
            
            this.emit(RunnerEvent.DISTANCE_CHANGE, Math.round((player.position.z - 10) / 2))
        } 

        // scoring
        for (let block of this.pathway.path) { 
            for (let coin of block.coins) {
                let distance = Vector3.DistanceSquared(coin.getAbsolutePosition(), this.player.getAbsolutePosition())

                if (distance < .25) {
                    this.score++ 
                    this.emit(RunnerEvent.SCORE_CHANGE, this.score)
                    coin.dispose() 
                    block.coins = block.coins.filter(i => i !== coin)
                } 
            }
        }
    }
    worldLoop() {
        if (this.state === State.RUNNING) {
            this.world.position.z = this.player.position.z 
        }
    }
    gameLoop() {
        this.cameraLoop()
        this.playerLoop()
        this.worldLoop()
    }
}
