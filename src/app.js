import "@babel/polyfill"
 
import makeScene from "./stage/scene"
import { load } from "./builders/models"  
import Pathway from "./stage/pathway/Pathway"
import Player from "./stage/Player"
import Camera from "./stage/Camera"
import World from "./stage/World"
import { RunnerEngine, RunnerEvent } from "./RunnerEngine" 

async function start() {
    try { 
        let { scene, shadowGenerator, runRenderLoop } = makeScene()

        await load()
 
        let player = new Player(scene, shadowGenerator)
        let camera = new Camera(scene, player)
        let pathway = new Pathway(scene, player, shadowGenerator) 
        let world = new World(scene)
        let runnerEngine = new RunnerEngine(scene, player, pathway, camera, world)

        runRenderLoop((light) => {  
            // objects
            player.beforeRender(pathway)
            camera.beforeRender(pathway, player)
            pathway.beforeRender(player)
            world.beforeRender(pathway, player)
            
            // recalc light for shadows
            light.position.z = player.position.z + 5
            
            // gameplay loop
            runnerEngine.gameLoop() 
        })

        // ui stuff here
        document.getElementById("app").style.opacity = 1
 
        runnerEngine
            .on(RunnerEvent.GAME_OVER, ({ reason }) => {
                document.getElementById("ui").innerHTML = `Game over <span>You ${reason}</span>`
            })
            .on(RunnerEvent.RESET, () => { 
                document.getElementById("ui").innerText = ""
            })
            .on(RunnerEvent.SCORE_CHANGE, (score) => {  
                document.getElementById("score").innerText = score
            })
            .on(RunnerEvent.DISTANCE_CHANGE, (distance) => {  
                document.getElementById("distance").innerText = distance +  "m"
            })     
    } catch (e) {
        console.error(e)
    }
}

document.body.addEventListener("touchmove", (e) => { 
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
})

start()
