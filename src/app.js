import "@babel/polyfill"
 
import makeScene from "./scene"
import { load } from "./utils/modelLoader"  
import Pathway from "./pathway/Pathway"
import Player from "./Player"
import Camera from "./Camera"
import World from "./World"
import RunnerEngine from "./RunnerEngine" 

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
            .on("gameover", ({ reason }) => {
                document.getElementById("ui").innerHTML = `Game over <span>You ${reason}</span>`
            })
            .on("reset", () => { 
                document.getElementById("ui").innerText = ""
            })
            .on("score-change", (score) => {  
                document.getElementById("score").innerText = score
            })
            .on("distance-change", (distance) => {  
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
