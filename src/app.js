import "@babel/polyfill"
 
import makeScene from "./scene"
import { load } from "./utils/modelLoader"  
import Pathway from "./pathway/Pathway"
import Player from "./Player"
import Camera from "./Camera"
import World from "./World"

const RUNNING = "running"
const GAME_OVER = "game-over"
const READY = "ready"
const LOADING = "loading"

async function start() {
    try { 
        let { scene, engine, shadowGenerator, beforeRender } = makeScene()

        await load()

        let state = READY
        let player = new Player(scene)
        let camera = new Camera(scene, player)
        let pathway = new Pathway(scene, player, shadowGenerator) 
        let world = new World(scene)

        shadowGenerator.addShadowCaster(player.mesh)
 
        player.on("gameover", ({ reason }) => {
            console.log("game over, you:", reason)
            state = GAME_OVER
            document.getElementById("debug").innerText = "Game over, you " + reason
        })
        player.on("reset", () => { 
            document.getElementById("debug").innerText = ""
        })
            
        engine.runRenderLoop(() => {
            player.beforeRender(pathway)
            camera.beforeRender()
            pathway.beforeRender()
            world.beforeRender(pathway, player)
            beforeRender(player)

            scene.render()
        })
        
        window.addEventListener("deviceorientation", (e) => {
            if (state === RUNNING) {
                player.move(e.gamma) 
            }
        }, false)
        window.addEventListener("mousemove", (e) => {
            if (state === RUNNING) {
                player.move((e.pageX - window.innerWidth / 2) / 2)
            }
        }, false)
        window.addEventListener("click", (e) => {
            e.stopPropagation()
            e.preventDefault()

            switch (state) {
                case READY: 
                    state = RUNNING
                    player.start()
                    break
                case RUNNING: 
                    player.jump()
                    break
                case GAME_OVER: 
                    state = RUNNING
                    pathway.clear()
                    pathway.init()
                    player.start()
            }
        })

        window.addEventListener("resize", () => {
            engine.resize()
            scene.render()  
        })
    } catch (e) {
        console.error(e)
    }
}

document.body.addEventListener("touchmove", (e) => { 
    e.preventDefault()
    e.stopPropagation()
})

start()
