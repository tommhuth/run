import "babel-polyfill"
import "../resources/resources"

import { Engine, Scene, FreeCamera, HemisphericLight, DirectionalLight, ShadowGenerator } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, StandardMaterial } from "babylonjs"
 
const WIDTH = 6
const HEIGHT = 10
const DEPTH = 4
const SPEHER_SIZE = .35

let blocks = [] 
let lastWasLow = false

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const camera = new FreeCamera("cam", new Vector3(-4, 4, 0), scene)
const light = new DirectionalLight("light", new Vector3(-4, -8, -4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hem = new HemisphericLight("", new Vector3(0, 1, 0), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)

hem.diffuse = Color3.Blue()  
hem.groundColor = Color3.Green()
 
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .05
scene.clearColor = new Color4(1, 1, 1, 0)
 
light.autoUpdateExtends = false
light.shadowMaxZ = DEPTH * 3
light.shadowMinZ = -DEPTH
 
player.position.y = SPEHER_SIZE / 2
player.position.x = 2
player.material = new StandardMaterial("s", scene)
player.material.diffuseColor = Color3.Red() 
player.receiveShadows = true

shadowGenerator.getShadowMap().renderList.push(player)
shadowGenerator.useBlurCloseExponentialShadowMap = true
shadowGenerator.blurScale = 2
shadowGenerator.bias = .000015
shadowGenerator.setDarkness(.7) 
shadowGenerator.normalBias = .0175 
shadowGenerator.frustumEdgeFalloff = .5
 
function makeBlock(forceLevel = false) { 
    const obstacle = MeshBuilder.CreateBox("box2", { height: 1 + Math.random() * 2, width: 1, depth: 1 }, scene) 
    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: DEPTH, depth: WIDTH }, scene)
    const color = Math.max(Math.random(), .4)

    obstacle.material = new StandardMaterial("s", scene)
    obstacle.material.diffuseColor = new Color3(0, 0, 1)
    obstacle.receiveShadows = true 
    obstacle.parent = box

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = Math.random() < .65 && blocks.length > 0 && !lastWasLow && !forceLevel ? -HEIGHT : -HEIGHT/2
    box.position.x = blocks.length ? blocks[blocks.length - 1].position.x + DEPTH : 0
    box.receiveShadows = true

    obstacle.position.y = 5
    obstacle.position.x = 0
    obstacle.position.z = DEPTH/2 * Math.random() * (Math.random() > .5 ? -1 : 1)
 
    shadowGenerator.getShadowMap().renderList.push(obstacle)
    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)  
    lastWasLow = box.position.y === -HEIGHT
}
 
for (let i = 0; i < 10; i++) {
    makeBlock(i < 5)
}

camera.setTarget(new Vector3(6, 0, 0))


document.body.addEventListener("keydown", e => {
    if(e.keyCode == 32 && player.position.y > SPEHER_SIZE/2 - .05 && player.position.y < SPEHER_SIZE/2 + .05){
        console.log("jump") 
    }
    
    if(e.keyCode == 37 || e.keyCode === 65){
        console.log("left") 
    }
    
    if(e.keyCode == 39 || e.keyCode === 68){
        console.log("right") 
    }
 
    if(e.keyCode == 87){
        console.log("up") 
    }
})

engine.runRenderLoop(() => { 
    let removed = []
 
    for (let block of blocks) {
        block.position.x -= .1 

        /*
        if(player.intersectsMesh(block.getChildren()[0], true, false)){
            console.error("game over") 
        }*/
        
        if (block.position.x <= -DEPTH/2) {
            removed.push(block) 
        }  
    } 

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block) 
        shadowGenerator.removeShadowCaster(block, true)
        block.dispose()

        makeBlock() 
    }

    scene.render()
})
