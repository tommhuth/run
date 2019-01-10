import "@babel/polyfill"
 
import makeScene from "./scene"
import { load } from "./utils/modelLoader"  
import Pathway from "./pathway/Pathway"
import Player from "./Player"
import Camera from "./Camera"
import World from "./World"
import Runner from "./Runner" 

async function start() {
    try { 
        let { scene, engine, shadowGenerator, beforeRender } = makeScene()

        await load()
 
        let player = new Player(scene, shadowGenerator)
        let camera = new Camera(scene, player)
        let pathway = new Pathway(scene, player, shadowGenerator) 
        let world = new World(scene)
        let runner = new Runner(scene, player, pathway, camera, world)

        engine.runRenderLoop(() => {
            // scene before render loop
            beforeRender(player)

            // objects
            player.beforeRender(pathway)
            camera.beforeRender(pathway, player)
            pathway.beforeRender(player)
            world.beforeRender(pathway, player)
            
            // gameplay loop
            runner.gameLoop()

            //render out
            scene.render()
        })

        // ui stuff here
        document.getElementById("app").style.opacity = 1
 
        runner.on("gameover", ({ reason }) => {
            console.log("game over: you ", reason) 
            document.getElementById("ui").innerHTML = `Game over <span>You ${reason}</span>`
        })
        runner.on("reset", () => { 
            document.getElementById("ui").innerText = ""
        })
        runner.on("score-change", (score) => { 
            console.log("score", score)
            document.getElementById("score").innerText = score
        })
        runner.on("distance-change", (distance) => { 
            console.log("distance", distance)
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
