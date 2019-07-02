import EventLite from "event-lite"
import { Vector3, MeshBuilder, StandardMaterial } from "babylonjs"
import { Config } from "./stage/pathway/Pathway"
import anime from "animejs"
import { random } from "./utils/helpers"

export const State = {
    READY: "ready",
    RUNNING: "running",
    GAME_OVER: "game-over"
}

export const RunnerEvent = {
    SCORE_CHANGE: "runner:score-change",
    DISTANCE_CHANGE: "runner:distance-change",
    GAME_OVER: "runner:game-over",
    RUNNING: "runner:running",
    RESET: "runner:reset"
}

export class RunnerEngine extends EventLite {
    scene
    state = State.READY
    score = 0
    distanceIncrement = 250
    distance = this.distanceIncrement
    hasSplashed = false
    playerVelocities = []
    velocityFramesCount = 3

    constructor(scene, player, pathway, camera, world, shadowGenerator) {
        super()
        this.scene = scene
        this.player = player
        this.pathway = pathway
        this.camera = camera
        this.world = world
        this.shadowGenerator = shadowGenerator

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
        } else {
            this.player.move(0)
        }
    }
    onMouseMove(e) {
        if (this.state === State.RUNNING) {
            this.player.move((e.pageX - window.innerWidth / 2) / 2)
        } else {
            this.player.move(0)
        }
    }
    onClick(e) {
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
        this.emit(RunnerEvent.SCORE_CHANGE, this.score)
        this.emit(RunnerEvent.RUNNING)
    }
    doReset() {
        this.playerVelocities.length = 0
        this.score = 0
        this.hasSplashed = false
        this.distance = this.distanceIncrement
        this.pathway.restart()
        this.camera.reset()
        this.player.start()

        this.emit(RunnerEvent.RESET)
        this.emit(RunnerEvent.SCORE_CHANGE, this.score)

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
                target.position.x += (player.rotation / 15 - target.position.x) / 60
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

            if (player.position.z - 10 >= this.distance) {
                this.emit(RunnerEvent.DISTANCE_CHANGE, this.distance)

                this.distance += this.distanceIncrement
            }

            if (player.position.y <= -4.25 && !this.hasSplashed) {
                for (let i = 0; i < random.integer(1, 2); i++) {
                    let splash = MeshBuilder.CreateDisc(null, { radius: .25, tessellation: 32 }, this.scene)
                    let x = { scale: 1, alpha: 1 }

                    splash.material = new StandardMaterial(this.scene)
                    splash.material.alpha = i / 3
                    splash.rotate(new Vector3(1, 0, 0), Math.PI / 2)
                    splash.position.set(
                        player.position.x + random.real(-.25, .25),
                        -4.5,
                        player.position.z + random.real(-.5, .5) + .5
                    )

                    anime({
                        targets: x,
                        scale: 7 + i,
                        delay: i * (random.real(25, 75)),
                        alpha: 0,
                        duration: 1200 + random.real(-200, 200),
                        easing: "easeOutCubic",
                        complete() {
                            splash.dispose(false, true)
                        },
                        change() {
                            splash.material.alpha = x.alpha
                            splash.scaling.set(x.scale, x.scale, x.scale)
                        }
                    })

                }
                
                console.log("splash")
                
                this.hasSplashed = true
                setTimeout(() => this.hasSplashed = false, 400)
            }
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
    pathwayLoop() {
        for (let block of this.pathway.path) {
            if (block.position.z < this.player.position.z + 22 && !block.hasShadows) {
                block.hasShadows = true
                this.shadowGenerator.addShadowCaster(block.group)
            }

            if (this.player.position.z > block.position.z + block.depth + 10 && this.state === State.RUNNING) {
                this.pathway.remove(block)
                this.shadowGenerator.removeShadowCaster(block.group, true)
            } else {
                block.beforeRender(this.player)
            }
        }

        if (this.pathway.zPosition - this.player.position.z < Config.FORWARD_BUFFER && this.state === State.RUNNING) {
            this.pathway.add()
        }
    }
    loop(light) {
        this.cameraLoop()
        this.playerLoop()
        this.worldLoop()
        this.pathwayLoop()

        this.player.beforeRender(this.pathway)
        this.camera.beforeRender(this.pathway, this.player)
        this.world.beforeRender(this.pathway, this.player)

        // recalc light for shadows
        light.position.z = this.player.position.z + 5
    }
}
