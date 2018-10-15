import "babel-polyfill"
import "../resources/resources"

import { Engine, Scene, HemisphericLight, DirectionalLight, ShadowGenerator, PhysicsImpostor, CannonJSPlugin, ArcRotateCamera } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, Mesh, StandardMaterial } from "babylonjs"
import uuid from "uuid" 

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

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("directionalLight", new Vector3(4, -5, 4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(3, 2, 1), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const cameraTarget = MeshBuilder.CreateBox("cameraTarget", { size: .1}, scene)
const camera = new ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 10, cameraTarget, scene)
const physicsPlugin = new CannonJSPlugin(true, 15)

let score = 0
let potentialScore = 0
let blocks = []   
let speed = 5

hemisphere.diffuse = Color3.Blue()  
hemisphere.groundColor = Color3.Green()
 
cameraTarget.visibility = 0

scene.enablePhysics(undefined, physicsPlugin)
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .055
scene.clearColor = new Color4(1, 1, 1, 0)
 
light.autoUpdateExtends = false
light.shadowMaxZ = DEPTH * 5
light.shadowMinZ = -DEPTH
 
player.position.y = 4
player.position.x = 0
player.position.z = 0
player.material = new StandardMaterial(uuid.v4(), scene)
player.material.diffuseColor = Color3.Red() 
player.receiveShadows = true
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)

shadowGenerator.addShadowCaster(player)
shadowGenerator.useBlurCloseExponentialShadowMap = true
shadowGenerator.blurScale = 2
shadowGenerator.bias = .000015
shadowGenerator.setDarkness(.7) 
shadowGenerator.normalBias = .0175   
 
function getZPosition(currentDepth) {
    const previousBlock = blocks[blocks.length - 1]

    return previousBlock ? previousBlock.position.z + previousBlock.depth / 2 + currentDepth / 2 : 0
}

function flip() {
    return Math.random() > .5 ? 1 : -1
}

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

    switch (type) {
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

function makeCoin(index) {
    const top = MeshBuilder.CreateCylinder(uuid.v4(), { 
        diameterBottom: 1.25, 
        diameterTop: 0, 
        height: 1, 
        tessellation: 4, 
        subdivisions: 4 
    }, scene)
    const bottom = MeshBuilder.CreateCylinder(uuid.v4(), { 
        diameterBottom: 1.25, 
        diameterTop: 0, 
        height: 1, 
        tessellation: 4, 
        subdivisions: 4 
    }, scene)
    const material = new StandardMaterial()
    
    material.diffuseColor = Color3.Yellow()

    top.material = material
    top.convertToFlatShadedMesh()
    bottom.convertToFlatShadedMesh() 
    bottom.material = material
    bottom.parent = top
    bottom.position.y = -1
    bottom.rotate(new Vector3(1, 0, 0), Math.PI) 

    top.scaling = new Vector3(.25, .25, .25)
    top.rotate(new Vector3(0, 1, 0), index * .4)
    top.registerBeforeRender(() => { 
        top.rotate(new Vector3(0, 1, 0), top.rotation.x + .1) 

        if (top.intersectsMesh(player, false, true)) {
            score++
            shadowGenerator.removeShadowCaster(top, true)

            setTimeout(() => top.dispose(false, true), 1)
             
            console.info("score", score)
        }
    }) 

    shadowGenerator.addShadowCaster(top, true) 
    potentialScore++

    return top
}

function makeBridge() { 
    const depth = DEPTH
    const height = 1
    const width = 1
    const block = MeshBuilder.CreateBox(uuid.v4(), { height, width, depth }, scene)
    const pillar = MeshBuilder.CreateBox(uuid.v4(), { height: HEIGHT, width: .75, depth: .75 }, scene)
    const previousBlock = blocks[blocks.length - 1]
    const lastWasBridge = previousBlock && previousBlock.type === PathType.BRIDGE 
    const color = Math.max(Math.random(), .4)
    const xPosition = (Math.random() * width / 2 - 1) * flip()

    if (Math.random() < .5){
        for (let i = 0; i < 3; i++) {
            const coin = makeCoin(i)
    
            coin.parent = block
            coin.position.y = 1
            coin.position.z = i * 1 - 1.5
        }
    }

    block.material = new StandardMaterial(uuid.v4(), scene)
    block.material.diffuseColor = new Color3(color, color, color) 
    block.position.y = -.5
    block.position.x = lastWasBridge ? previousBlock.position.x : xPosition
    block.position.z = getZPosition(depth)
    block.receiveShadows = true
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
   
    pillar.parent = block 
    pillar.position.y = -HEIGHT/2

    shadowGenerator.getShadowMap().renderList.push(block, pillar)
    
    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth,
        main: block,
        type: PathType.BRIDGE,
        get position() {
            return block.position
        },
        dispose() {
            block.dispose()
            shadowGenerator.removeShadowCaster(block, true) 
        }
    }) 
}

function makeHighIsland() { 
    const islandDepth = DEPTH - Math.random() * 1.5
    const totalDepth = islandDepth + 4.25
    const width = WIDTH - Math.random() * 4
    const height = 2 + Math.random() * 1.5
    const block = MeshBuilder.CreateBox(uuid.v4(), { height, width, depth: islandDepth }, scene)
    const color = Math.max(Math.random(), .4)

    /*
    for (let i = 0; i < 3; i++) { 
        const coin = makeCoin()

        coin.parent = block
        coin.position.y = 3
        coin.position.x = 0
        coin.position.z = 0  
    }
    */
 
    block.material = new StandardMaterial(uuid.v4(), scene)
    block.material.diffuseColor = new Color3(color, color, color)   
    
    block.position.y = -1
    block.position.z = getZPosition(totalDepth)
    block.position.x = Math.random() * flip()
    block.receiveShadows = true 
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene) 

    shadowGenerator.addShadowCaster(block)

    blocks.push({
        width,
        height,
        depth: totalDepth,
        main: block,
        type: PathType.HIGH_ISLAND,
        get position() {
            return block.position
        },
        dispose() {
            block.dispose()
            shadowGenerator.removeShadowCaster(block, true)
        }
    })    
}

function makeFull(doObstacle) { 
    const depth = DEPTH + Math.random() * 4
    const block = MeshBuilder.CreateBox(uuid.v4(), { height: HEIGHT, width: WIDTH, depth }, scene)
    const color = Math.max(Math.random(), .4) 

    if (doObstacle && Math.random() > .5) { 
        const obstacle = MeshBuilder.CreateBox(uuid.v4(), { height: 2, width: 1, depth: 1 }, scene) 
        
        obstacle.material = new StandardMaterial(uuid.v4(), scene)
        obstacle.material.diffuseColor = new Color3(0, 0, 1)
        obstacle.receiveShadows = true 
        obstacle.parent = block

        obstacle.position.y = HEIGHT/2 - Math.random() * 1.5
        obstacle.position.z = 0
        obstacle.position.x = (WIDTH/2 * Math.random() - .5) * (Math.random() > .5 ? -1 : 1)
        obstacle.physicsImpostor = new PhysicsImpostor(obstacle, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

        shadowGenerator.addShadowCaster(obstacle)
    }

    block.material = new StandardMaterial(uuid.v4(), scene)
    block.material.diffuseColor = new Color3(color, color, color) 
    block.position.y = -HEIGHT/2
    block.position.z = getZPosition(depth)
    block.receiveShadows = true 
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    shadowGenerator.addShadowCaster(block)

    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth,
        main: block,
        type: PathType.FULL,
        get position() {
            return block.position
        },
        dispose() {
            block.dispose()
            shadowGenerator.removeShadowCaster(block, true)
        }
    }) 
}

function makeGap() {  
    const depth = Math.max(Math.random() * (DEPTH + 1), 2) 
    const position = new Vector3()

    position.z = getZPosition(depth)
    
    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth, 
        type: PathType.GAP,
        get position() {
            return position
        },
        dispose() { }
    })   
}
 
function init() { 
    makeBlock(PathType.FULL) 
    makeBlock(PathType.FULL)  
    makeBlock(PathType.HIGH_ISLAND)  
    makeBlock(PathType.FULL)     
    makeBlock(PathType.BRIDGE)     
    makeBlock(PathType.FULL)     
    makeBlock(PathType.GAP)     
    makeBlock(PathType.HIGH_ISLAND)     
}

init() 
   
document.body.addEventListener("keydown", e => {
    if (e.keyCode == 32 ) { 
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)
    }
    
    if (e.keyCode == 37 || e.keyCode === 65) { 
        player.physicsImpostor.applyImpulse(new Vector3(-3, 0, 0), player.position)
    } 
    
    if (e.keyCode == 39 || e.keyCode === 68) { 
        player.physicsImpostor.applyImpulse(new Vector3(3, 0, 0), player.position)
    }    
}) 

document.body.addEventListener("touchstart", (e) => {
    player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)   

    e.preventDefault()
})
 

scene.beforeRender = () => {   
    let removed = []   
    let velocity = player.physicsImpostor.getLinearVelocity().clone() 

    velocity.z = player.position. y < -1 ? 0 : speed
    velocity.x *= .9
    player.physicsImpostor.setLinearVelocity(velocity)

    light.position.z = player.position.z 
    cameraTarget.position.z = player.position.z + 3
 
    for (let block of blocks) {
        if (player.position.z >= block.position.z + block.depth) {
            removed.push(block) 
        }  
    }  

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block) 
        
        block.dispose() 
        makeBlock() 
    } 
}

engine.runRenderLoop(() => {   
    scene.render()  
})
