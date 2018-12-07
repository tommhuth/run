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
        let { scene, engine } = makeScene()

        await load()

        let state = READY
        let player = new Player(scene)
        let camera = new Camera(scene, player)
        let pathway = new Pathway(scene, player) 
        let world = new World(scene)


        player.gameOver = () => {
            state = GAME_OVER
        }
            
        engine.runRenderLoop(() => {
            player.beforeRender(pathway)
            camera.beforeRender()
            pathway.beforeRender()
            world.beforeRender(pathway, player)

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
                    player.init()
                    break
                case RUNNING:
                    player.jump()
                    break
                case GAME_OVER:
                    state = RUNNING
                    pathway.clear()
                    pathway.init()
                    player.init()
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
