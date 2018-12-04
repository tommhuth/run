import "@babel/polyfill"
 
import makeScene from "./scene"
import { load } from "./utils/modelLoader"  
import Pathway from "./pathway/Pathway"
import Player from "./Player"
import Camera from "./Camera"
import World from "./World"

async function start() {
    try { 
        const { scene, engine } = makeScene()

        await load()

        const player = new Player(scene)
        const camera = new Camera(scene, player)
        const pathway = new Pathway(scene, player) 
        const world = new World(scene)
            
        engine.runRenderLoop(() => {
            player.beforeRender(pathway)
            camera.beforeRender()
            pathway.beforeRender()
            world.beforeRender(pathway, player)

            scene.render()  
        })
        
        window.addEventListener("resize", () => engine.resize())
    } catch (e) {
        console.error(e)
    }
}

document.body.addEventListener("touchmove", (e) => { 
    e.preventDefault()
    e.stopPropagation()
})

start()
