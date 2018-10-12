import "babel-polyfill"
import "../resources/resources"

import { Engine, Scene, HemisphericLight, DirectionalLight, ShadowGenerator, PhysicsImpostor, FollowCamera, ArcRotateCamera, CubeMapToSphericalPolynomialTools } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, StandardMaterial } from "babylonjs"
 
const WIDTH = 6
const HEIGHT = 25
const DEPTH = 4
const SPEHER_SIZE = .35
const PathType = {
    FULL: "full",
    BRIDGE: "bridge",
    GAP: "gap",
    HIGH_ISLAND: "high-island"
}
const PathSettings = {
    [PathType.FULL]: {
        illegalNext: []
    }, 
    [PathType.HIGH_ISLAND]: {
        illegalNext: [PathType.BRIDGE, PathType.GAP]
    },
    [PathType.GAP]: {
        illegalNext: [PathType.GAP, PathType.BRIDGE, PathType.HIGH_ISLAND]
    },
    [PathType.BRIDGE]: {
        illegalNext: [PathType.GAP, PathType.HIGH_ISLAND]
    }
}

let score = 0
let blocks = []  

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("light", new Vector3(4, -5, 4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hemisphere = new HemisphericLight("", new Vector3(3, 2, 1), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const cameraTarget = MeshBuilder.CreateBox("", { size: .1}, scene)
const camera = new ArcRotateCamera("cam",  -Math.PI/2, Math.PI/3, 10, cameraTarget, scene)
  
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
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1, disableBidirectionalTransformation: true }, scene)

shadowGenerator.getShadowMap().renderList.push(player)
shadowGenerator.useBlurCloseExponentialShadowMap = true
shadowGenerator.blurScale = 2
shadowGenerator.bias = .000015
shadowGenerator.setDarkness(.7) 
shadowGenerator.normalBias = .0175   
 
function getRandomBlock(){
    let types = Object.values(PathType) 
  
    return types[Math.floor(Math.random() * types.length)]
}

function makeBlock(forceType) { 
    let type = forceType || getRandomBlock()
    let previousBlock = blocks[blocks.length-1]

    if (previousBlock && !forceType) {  
        while (PathSettings[previousBlock.type].illegalNext.length && PathSettings[previousBlock.type].illegalNext.includes(type)) {
            type = getRandomBlock()
        }
    }
    
    console.log("buidling", type)

    switch(type) {
        case PathType.FULL:
            return makeFull(true)
        case PathType.GAP:
            return makeGap()
        case PathType.BRIDGE:
            return makeBridge()
        case PathType.HIGH_ISLAND:
            return makeHighIsland() 
    }
}

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

    shadowGenerator.getShadowMap().renderList.push(top, bottom)

    top.registerBeforeRender(() => { 
        top.rotate(new Vector3(0, 1, 0), top.rotation.x + .1) 

        if(top.intersectsMesh(player, false, true)) {
            score++
            shadowGenerator.removeShadowCaster(top, true)

            setTimeout(() => top.dispose(false, true), 1)
             
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
    }

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -.5
    box.position.x = lastWasBridge ? last.position.x : (Math.random() * WIDTH/2 -1) * (Math.random() > .5 ? -1 : 1) 
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH : 0
    box.receiveShadows = true
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass:0, disableBidirectionalTransformation: true }, scene)

    box.type = PathType.BRIDGE
    box.width = 1

    pillar.parent = box 
    pillar.position.y = -HEIGHT/2

    shadowGenerator.getShadowMap().renderList.push(box, pillar)
    blocks.push(box)   
}

function makeHighIsland() { 
    const box = MeshBuilder.CreateBox("box", { height: 1, width: WIDTH, depth: DEPTH * 1.5 }, scene)
    const island = MeshBuilder.CreateBox("box", { height: HEIGHT , width: WIDTH - 2, depth: DEPTH -2 }, scene)
    const color = Math.max(Math.random(), .4)

    for(let i = 0; i < 3; i++) { 
        const coin = makeCoin()

        coin.parent = box
        coin.position.y = HEIGHT + 1 + (i*.25)
        coin.position.z = i * .6 - 4.5
    }
 
    island.material = new StandardMaterial("s", scene)
    island.material.diffuseColor = new Color3(color, color, color) 
    box.position.y = -HEIGHT
    box.position.z = blocks.length ? blocks[blocks.length - 1].position.z + DEPTH * 1.5 : 0
    
    island.receiveShadows = true 
    island.physicsImpostor = new PhysicsImpostor(island, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
    island.parent = box
    box.type = PathType.HIGH_ISLAND
    island.width = WIDTH
    island.position.y = 13
    island.position.z = -.5
    island.position.x = 0

    shadowGenerator.getShadowMap().renderList.push(island)
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
        obstacle.physicsImpostor = new PhysicsImpostor(obstacle, PhysicsImpostor.BoxImpostor, { mass: 0, disableBidirectionalTransformation: true }, scene)

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
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE) 
    makeBlock(PathType.BRIDGE)  
}

init() 
  
// && player.position.y > SPEHER_SIZE/2 - .05 && player.position.y < SPEHER_SIZE/2 + .05
document.body.addEventListener("keydown", e => {
    if (e.keyCode == 32 ) { 
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)
    }
    
    if (e.keyCode == 37 || e.keyCode === 65) { 
        player.physicsImpostor.applyImpulse(new Vector3(-4, 0, 0), player.position)
    } 
    
    if (e.keyCode == 39 || e.keyCode === 68) { 
        player.physicsImpostor.applyImpulse(new Vector3(4, 0, 0), player.position)
    }    
}) 

document.body.addEventListener("touchstart", () => {
    player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)   
})

let speed = 5 
 

engine.runRenderLoop(() => {   
    let removed = []   

    for (let block of blocks) {
        if (player.position.z >= block.position.z + DEPTH) {
            removed.push(block) 
        }  
    }  
    
    let velocity = player.physicsImpostor.getLinearVelocity().clone()

    velocity.z = speed
    velocity.x *= .95

    player.physicsImpostor.setLinearVelocity(velocity)
    light.position.z = player.position.z 

    cameraTarget.position.z = player.position.z + 3

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block) 
        setTimeout(() => {
            shadowGenerator.removeShadowCaster(block, true)
            block.dispose(false, true)
        }, 1)

        makeBlock() 
    }

    scene.render()
})
