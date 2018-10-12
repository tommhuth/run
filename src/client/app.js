import "babel-polyfill"
import "../resources/resources"

import { Engine, Scene, HemisphericLight, DirectionalLight, ShadowGenerator, PhysicsImpostor, FollowCamera } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, StandardMaterial } from "babylonjs"
 
const WIDTH = 6
const HEIGHT = 25
const DEPTH = 4
const SPEHER_SIZE = .35
const PathType = {
    FULL: "full",
    BRIDGE: "bridge",
    GAP: "gap"
}
const PathSettings = {
    [PathType.FULL]: {
        illegalNext: []
    },
    [PathType.GAP]: {
        illegalNext: [PathType.GAP, PathType.BRIDGE]
    },
    [PathType.BRIDGE]: {
        illegalNext: [PathType.GAP]
    }
}

let blocks = []  

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("light", new Vector3(4, -5, 4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hemisphere = new HemisphericLight("", new Vector3(0, 1, 0), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const camera = new FollowCamera("cam", new Vector3(0,0,0), scene)
 
camera.radius = 10
camera.heightOffset = 6
camera.rotationOffset = 180

hemisphere.diffuse = Color3.Blue()  
hemisphere.groundColor = Color3.Green()

scene.enablePhysics()
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .05
scene.clearColor = new Color4(1, 1, 1, 0)
 
light.autoUpdateExtends = false
light.shadowMaxZ = DEPTH * 6
light.shadowMinZ = -DEPTH
 
player.position.y = 4 
player.position.x = 0
player.position.z = 5
player.material = new StandardMaterial("s", scene)
player.material.diffuseColor = Color3.Red() 
player.receiveShadows = true
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1 }, scene)

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
    let previousBlock = blocks[blocks.length-1]

    if (previousBlock && !forceType) { 
        type = getRandomBlock()

        while (PathSettings[previousBlock.type].illegalNext.length && PathSettings[previousBlock.type].illegalNext.includes(type)) {
            console.log("illegal", previousBlock.type, type )
            type = getRandomBlock()
        }
    }

    switch(type) {
        case PathType.FULL:
            return makeFull(true)
        case PathType.GAP:
            return makeGap()
        case PathType.BRIDGE:
            return makeBridge()
            /*
        case PathType.NARROW:
            return makeNarrow()*/
    }
}

let score = 0

function makeCoin() {
    const top = MeshBuilder.CreateCylinder("s", { diameterBottom: 1.25, diameterTop: 0, height: 1, tessellation: 4, subdivisions: 4 }, scene)
    const bottom = MeshBuilder.CreateCylinder("s", { diameterBottom: 1.25, diameterTop: 0, height: 1, tessellation: 4, subdivisions: 4 }, scene)
    const material = new StandardMaterial()
    material.diffuseColor = Color3.Yellow()

    top.convertToFlatShadedMesh()
    bottom.convertToFlatShadedMesh() 
     
    bottom.material = material
    top.material = material
    bottom.parent = top
    bottom.position.y = -1
    bottom.rotate(new Vector3(1, 0, 0), Math.PI) 

    top.scaling = new Vector3(.25, .25, .25)

    top.registerBeforeRender(() => { 
        top.rotate(new Vector3(0, 1, 0), top.rotation.x + .1) 

        if(top.intersectsMesh(player, false, true)) {
            score++
            shadowGenerator.removeShadowCaster(top, true)

            setTimeout(() => top.dispose(true, true), 1)
            
            //
            console.info("score", score)
        }
    }) 

    return top
}

function makeBridge() { 
    const box = MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: DEPTH }, scene)
    const pillar = MeshBuilder.CreateBox("box", { height: HEIGHT, width: .75, depth: .75 }, scene)
   
    const color = Math.max(Math.random(), .4)
    const last = blocks[blocks.length-1]
    const lastWasBridge = last && (last.type === PathType.BRIDGE || last.type === PathType.NARROW)

    for(let i = 0; i < 3; i++) {
        const coin = makeCoin()

        coin.parent = box
        coin.position.y = 1
        coin.position.z = i * 1 - 1.5
        shadowGenerator.getShadowMap().renderList.push(coin, coin.getChildren()[0])
    }

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -.5
    box.position.x = lastWasBridge ? last.position.x : (Math.random() * WIDTH/2 -1) * (Math.random() > .5 ? -1 : 1) 
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH : 0
    box.receiveShadows = true
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass:0 }, scene)

    box.type = PathType.BRIDGE
    box.width = 1

    pillar.parent = box 
    pillar.position.y = -HEIGHT/2

    shadowGenerator.getShadowMap().renderList.push(box, pillar)
    blocks.push(box)   
}
 
function makeNarrow() { 
    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: DEPTH, depth: WIDTH/2 }, scene)
    const color = Math.max(Math.random(), .4) 
    const last = blocks[blocks.length-1]

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -HEIGHT/2
    box.position.x = last ? last.position.x  : 0
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH : 0
    box.receiveShadows = true

    box.type = PathType.NARROW
    box.width = WIDTH/2

    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)   
}

function makeFull(doObstacle) { 
    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: WIDTH, depth: DEPTH }, scene)
    const color = Math.max(Math.random(), .4)

    if (doObstacle && Math.random() > .5) { 
        const obstacle = MeshBuilder.CreateBox("box2", { height: 2, width: 1, depth: 1 }, scene) 
        
        obstacle.material = new StandardMaterial("s", scene)
        obstacle.material.diffuseColor = new Color3(0, 0, 1)
        obstacle.receiveShadows = true 
        obstacle.parent = box

        obstacle.position.y = HEIGHT/2 - Math.random() * 1.5
        obstacle.position.z = 0
        obstacle.position.x = (WIDTH/2 * Math.random() - .5) * (Math.random() > .5 ? -1 : 1)
        obstacle.physicsImpostor = new PhysicsImpostor(obstacle, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

        shadowGenerator.getShadowMap().renderList.push(obstacle)
    }

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -HEIGHT/2
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH : 0
    box.receiveShadows = true 
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    box.type = PathType.FULL
    box.width = WIDTH

    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)   
}

function makeGap() { 
    const box = MeshBuilder.CreateBox("box", { height: 1, width: WIDTH, depth: DEPTH }, scene)
  
    box.position.y = -HEIGHT
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH : 0  
    box.type = PathType.GAP
    box.width = WIDTH
 
    blocks.push(box)   
}
 
function init() { 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.FULL)  
    makeBlock() 
    makeBlock()  
    makeBlock()  
}

init() 
  

document.body.addEventListener("keydown", e => {
    if (e.keyCode == 32 && player.position.y > SPEHER_SIZE/2 - .05 && player.position.y < SPEHER_SIZE/2 + .05) { 
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.getAbsolutePosition())
    }
    
    if (e.keyCode == 37 || e.keyCode === 65) { 
        player.physicsImpostor.applyImpulse(new Vector3(-4, 0, 0), player.position)
    } 
    
    if (e.keyCode == 39 || e.keyCode === 68) { 
        player.physicsImpostor.applyImpulse(new Vector3(4, 0, 0), player.position)
    }   
})

let cameraTarget = MeshBuilder.CreateBox("", { size: .1}, scene)
let speed = 5 
let ticks = 0

engine.runRenderLoop(() => {   
    let removed = []  
    ticks++

    for (let block of blocks) {
        if (player.position.z >= block.position.z + DEPTH) {
            removed.push(block) 
        }  
    }  
    
    let vel = player.physicsImpostor.getLinearVelocity().clone()
    vel.z = ticks > 50 ? speed : 0
    vel.x *= .95

    player.physicsImpostor.setLinearVelocity(vel)
    light.position.z = player.position.z 

    cameraTarget.position = new Vector3(0, 0, player.position.z + 4)
    camera.lockedTarget = cameraTarget

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block) 
        shadowGenerator.removeShadowCaster(block, true)
        block.dispose()

        makeBlock() 
    }

    scene.render()
})
