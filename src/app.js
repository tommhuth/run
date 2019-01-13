import "@babel/polyfill"
 
import makeScene from "./stage/scene"
import { load } from "./builders/models"  
import Pathway from "./stage/pathway/Pathway"
import Player from "./stage/Player"
import Camera from "./stage/Camera"
import World from "./stage/World"
import { RunnerEngine, RunnerEvent } from "./RunnerEngine" 
import * as ui from "./ui"

async function start() {
    try { 
        let { scene, shadowGenerator, runRenderLoop } = makeScene()

        await load()
 
        let player = new Player(scene, shadowGenerator)
        let camera = new Camera(scene, player)
        let pathway = new Pathway(scene, player) 
        let world = new World(scene)
        let runnerEngine = new RunnerEngine(scene, player, pathway, camera, world, shadowGenerator)
 
        runRenderLoop((light) => {  
            // gameplay loop
            runnerEngine.loop(light) 
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
                ui.distanceAlert(distance)
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


if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    // Use the window load event to keep the page load performant
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
    })
}

start()
