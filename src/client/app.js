import "babel-polyfill"
import "../resources/resources"

import { Engine, Scene, FreeCamera, HemisphericLight, DirectionalLight, ShadowGenerator, PathCursor } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, StandardMaterial } from "babylonjs"
 
const WIDTH = 6
const HEIGHT = 25
const DEPTH = 4
const SPEHER_SIZE = .35
const PathType = {
    FULL: "full",
    BRIDGE: "bridge",
    //GAP: "gap",
    NARROW: "narrow"
}

let blocks = []
let lastWasLow = false
let jumping = false
let movingLeft = false 
let movingRight = false

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const camera = new FreeCamera("cam", new Vector3(-4, 4, 0), scene)
const light = new DirectionalLight("light", new Vector3(4, -8, 4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hemisphere = new HemisphericLight("", new Vector3(0, 1, 0), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)

hemisphere.diffuse = Color3.Blue()  
hemisphere.groundColor = Color3.Green()
 
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .05
scene.clearColor = new Color4(1, 1, 1, 0)
 
light.autoUpdateExtends = false
light.shadowMaxZ = DEPTH * 6
light.shadowMinZ = -DEPTH
 
player.position.y = 4
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
 
function getRandomBlock(){
    let types = Object.values(PathType)
    let ra = Math.random()

    if(ra >= .65){
        return PathType.FULL
    } 

    return types[Math.floor(Math.random() * types.length)]
}

function makeBlock(forceType) { 
    let type = forceType || getRandomBlock()

    switch(type) {
        case PathType.FULL:
            return makeFull(forceType ? false : true)
        case PathType.BRIDGE:
            return makeBridge()
        case PathType.NARROW:
            return makeNarrow()
    }
}

function makeBridge() { 
    const box = MeshBuilder.CreateBox("box", { height: 1, width: DEPTH, depth: 1 }, scene)
    const color = Math.max(Math.random(), .4)
    const last = blocks[blocks.length-1]
    const lastWasBridge = last && (last.type === PathType.BRIDGE || last.type === PathType.NARROW)

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -.5
    box.position.z = lastWasBridge ? last.position.z : Math.random() * DEPTH/2 * (Math.random() > .5 ? -1 : 1)
    box.position.x = blocks.length ? blocks[blocks.length - 1].position.x + DEPTH : 0
    box.receiveShadows = true

    box.type = PathType.BRIDGE
    box.width = 1

    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)   
}
 
function makeNarrow() { 
    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: DEPTH, depth: WIDTH/2 }, scene)
    const color = Math.max(Math.random(), .4) 
    const last = blocks[blocks.length-1]

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -HEIGHT/2
    box.position.z = last ? last.position.z  : 0
    box.position.x = blocks.length ? blocks[blocks.length - 1].position.x + DEPTH : 0
    box.receiveShadows = true

    box.type = PathType.NARROW
    box.width = WIDTH/2

    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)   
}

function makeFull(doObstacle) { 
    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: DEPTH, depth: WIDTH }, scene)
    const color = Math.max(Math.random(), .4)

    if (doObstacle) { 
        const obstacle = MeshBuilder.CreateBox("box2", { height: 1 + Math.random() * 2, width: 1, depth: 1 }, scene) 
        
        obstacle.material = new StandardMaterial("s", scene)
        obstacle.material.diffuseColor = new Color3(0, 0, 1)
        obstacle.receiveShadows = true 
        obstacle.parent = box

        obstacle.position.y = HEIGHT/2
        obstacle.position.x = 0
        obstacle.position.z = DEPTH/2 * Math.random() * (Math.random() > .5 ? -1 : 1)

        shadowGenerator.getShadowMap().renderList.push(obstacle)
    }

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -HEIGHT/2
    box.position.x = blocks.length ? blocks[blocks.length - 1].position.x + DEPTH : 0
    box.receiveShadows = true

    box.type = PathType.FULL
    box.width = WIDTH

    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)   
}
 
function init() { 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL)
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.NARROW) 
    makeBlock(PathType.BRIDGE) 
}

init()

camera.setTarget(new Vector3(6, 0, 0))

document.body.addEventListener("keyup", () => {
    movingLeft = false 
    movingRight = false 
    jumping = false
})

document.body.addEventListener("keydown", e => {
    if (e.keyCode == 32 && player.position.y > SPEHER_SIZE/2 - .05 && player.position.y < SPEHER_SIZE/2 + .05) { 
        jumping = true
    }
    
    if (e.keyCode == 37 || e.keyCode === 65) { 
        movingLeft = true
    } 
    
    if (e.keyCode == 39 || e.keyCode === 68) { 
        movingRight = true 
    }   
})

let speed = .1
let ticks = 0
let gameOver = false

engine.runRenderLoop(() => {   
    let removed = []
    let falling = true  
    ticks++

    for (let block of blocks) {
        let [obstacle] = block.getChildren()
        block.position.x -= speed
        
        if (player.intersectsMesh(block)) {
            falling = false
        }

        if (obstacle && player.intersectsMesh(obstacle) && ticks > 1) {
            gameOver = true
        }
        
        if (block.position.x <= -DEPTH/2) {
            removed.push(block) 
        }  
    }  

    if (player.position.y < 0) {
        gameOver = true
    }

    if (gameOver) {
        speed = 0
        console.error("game over")
    }

    if (falling) {
        player.position.y -= .045
    }  
  
    if (movingLeft) {
        player.position.z += .05
    }
    if (movingRight) {
        player.position.z -= .05
    }

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block) 
        shadowGenerator.removeShadowCaster(block, true)
        block.dispose()

        makeBlock() 
    }

    scene.render()
})
