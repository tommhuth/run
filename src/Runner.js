import EventLite from "event-lite"
import { Config } from "./pathway/Pathway"
import {Vector3} from "babylonjs"

const State = {
    READY: "ready",
    RUNNING: "running",
    GAME_OVER: "game over"
}

export default class Runner extends EventLite {
    scene
    state = State.READY
    ticks = 0
    score = 0
    lives = 1
    distance = 0

    constructor(scene, player, pathway, camera, world) {
        super()
        this.scene = scene
        this.player = player
        this.pathway = pathway
        this.camera = camera
        this.world = world

        window.addEventListener("deviceorientation", (e) => {
            if (this.state === State.RUNNING) {
                this.player.move(e.gamma) 
            }
        }, false)

        window.addEventListener("mousemove", (e) => {
            if (this.state === State.RUNNING) {
                this.player.move((e.pageX - window.innerWidth / 2) / 2)
            }
        }, false)

        window.addEventListener("click", (e) => {
            e.stopPropagation()
            e.preventDefault()

            switch (this.state) {
                case State.READY: 
                    this.state = State.RUNNING
                    this.player.start()
                    this.camera.running()
                    break
                case State.RUNNING: 
                    this.player.jump()
                    break
                case State.GAME_OVER: 
                    this.state = State.RUNNING
                    this.ticks = 0
                    this.score = 0
                    this.pathway.restart()
                    this.camera.reset()
                    this.player.start()
                    this.emit("reset")
                    this.emit("score-change", this.score)
                    break
            }
        })
    }

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
        // player movement
        if (this.state === State.RUNNING) {
            let player = this.player    
            let floorDelimiter = -(Config.HEIGHT + 1)
            let velocity = player.impostor.getLinearVelocity().clone() 
            let fallen = player.position.y < floorDelimiter
            let stopped = velocity.z < 1 && player.position.y >= floorDelimiter
        
            if ((fallen || stopped) && this.ticks > 5) {
                let reason = fallen ? "fell off" : "crashed"
                
                this.emit("gameover", { reason })
                this.state = State.GAME_OVER
                this.camera.gameOver()
                player.impostor.setLinearVelocity(Vector3.Zero())
            } else { 
                velocity.z = player.speed
                velocity.x = player.rotation / 22
        
                player.impostor.setLinearVelocity(velocity) 
                player.rotation += (player.targetRotation - player.rotation) / 4
    
                this.ticks++ 
            }

            this.emit("distance-change", Math.round((player.position.z - 10) * 1.5))
        } 

        // scoring
        for (let block of this.pathway.path) {
                
            for (let coin of block.coins) {
                let distance = Vector3.DistanceSquared(coin.getAbsolutePosition(), this.player.getAbsolutePosition())

                if (distance < .25) {
                    this.score++ 
                    this.emit("score-change", this.score)
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
