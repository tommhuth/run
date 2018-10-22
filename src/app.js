import "babel-polyfill" 

import { Engine, Scene, HemisphericLight, DirectionalLight, PhysicsImpostor, CannonJSPlugin, ArcRotateCamera } from "babylonjs"
import { Color3, Color4, Vector3 } from "babylonjs"
import { MeshBuilder, StandardMaterial } from "babylonjs" 
import uuid from "uuid"

const WIDTH = 6
const HEIGHT = 40
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
let potentialScore = 0
let blocks = []   
let speed = 5
let rotation = 0
let started = false 
let gameOver = false

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("directionalLight", new Vector3(4.5, -5.1, 4.1), scene) 
const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(3, 2, 1), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const cameraTarget = MeshBuilder.CreateBox("cameraTarget", { size: .1}, scene)
const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 40, cameraTarget, scene) 
const physicsPlugin = new CannonJSPlugin(true, 20) 

const baseMaterial = new StandardMaterial()
baseMaterial.diffuseColor = new Color3(1,1,1)

scene.autoClear = false // Color buffer
scene.autoClearDepthAndStencil = false // Depth and stencil, obviously
scene.blockMaterialDirtyMechanism = true

light.position.x = 0
light.position.y = 0
light.position.z = 0
light.diffuse = Color3.Yellow()

hemisphere.diffuse = Color3.Red()  
hemisphere.groundColor = Color3.Blue()
 
cameraTarget.visibility = 0 
cameraTarget.position.z = 30

scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .055
scene.clearColor = new Color4(1, 1, 1, 1)
  
player.position.y = 4
player.position.x = 0
player.position.z = 0
player.material = new StandardMaterial(uuid.v4(), scene)
player.material.diffuseColor = Color3.Red()  
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
 
function getZPosition(currentDepth) {
    const previousBlock = blocks[blocks.length - 1]

    if (previousBlock) {
        return previousBlock.position.z + previousBlock.depth / 2 + currentDepth / 2
    }

    return 0
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

let rotateY = new Vector3(0, 1, 0)

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
    top.rotate(new Vector3(0, 1, 0), index * .25)
    top.registerBeforeRender(() => { 
        top.rotate(rotateY, top.rotation.x + .075) 

        if (top.intersectsMesh(player, false, true)) {
            score++ 

            setTimeout(() => top.dispose(false, true), 1)
             
            console.info("score", score, "of", potentialScore)
        }
    }) 
 
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
    const xPosition = (Math.random() * width / 2 - 1) * flip()

    if (Math.random() < .5){
        for (let i = 0; i < 3; i++) {
            const coin = makeCoin(i)
    
            coin.parent = block
            coin.position.y = 1
            coin.position.z = i * 1 - 1.5 
        }
    }

    block.material = baseMaterial
    block.position.y = -.5
    block.position.x = lastWasBridge ? previousBlock.position.x : xPosition
    block.position.z = getZPosition(depth) 
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
   
    pillar.parent = block 
    pillar.position.y = -HEIGHT/2 
    pillar.freezeWorldMatrix()
    block.freezeWorldMatrix()
    
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
        }
    }) 
}

function makeHighIsland() { 
    const islandDepth = DEPTH - Math.random() * 1.5
    const totalDepth = islandDepth + 4.25
    const width = WIDTH - Math.random() * 4
    const height = 2 + Math.random() * 1.5
    const block = MeshBuilder.CreateBox(uuid.v4(), { height, width, depth: islandDepth }, scene) 

    for (let i = 0; i < 3; i++) { 
        const coin = makeCoin(i)

        coin.parent = block
        coin.position.y = height/2+.5
        coin.position.x = 0
        coin.position.z = i * 1 - 1.5
    } 
 
    block.material = baseMaterial 
    
    block.position.y = -1
    block.position.z = getZPosition(totalDepth)
    block.position.x = Math.random() * flip() 
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene) 
 
    block.freezeWorldMatrix()

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
        }
    })    
}
 
function makeFull(doObstacle) { 
    const depth = DEPTH + Math.random() * 4
    const block = MeshBuilder.CreateBox(uuid.v4(), { height: HEIGHT, width: WIDTH, depth }, scene) 

    if (doObstacle) { 
        const obstacle = MeshBuilder.CreateBox(uuid.v4(), { height: 2, width: 1, depth: 1 }, scene) 
        
        obstacle.material = baseMaterial
        obstacle.parent = block

        obstacle.position.y = Math.random() * flip()
        obstacle.position.z = getZPosition(depth) +  (Math.random() * depth/2 - 1) * flip() 
        obstacle.position.x =  (WIDTH/2 * Math.random() - .5) * flip()
        obstacle.physicsImpostor = new PhysicsImpostor(obstacle, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
        obstacle.freezeWorldMatrix()
    }

    block.material = baseMaterial
    block.position.y = -HEIGHT/2
    block.position.z = getZPosition(depth) 
    block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    block.freezeWorldMatrix()
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
    makeBlock(PathType.FULL)      
    makeBlock(PathType.BRIDGE)          
    makeBlock(PathType.BRIDGE)           
    makeBlock()           
    makeBlock()           
    makeBlock()           
    makeBlock()            
}

init()  

canvas.addEventListener("keydown", e => {
    if (e.keyCode == 32 ) { 
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)
    }
    
    if (e.keyCode == 37 || e.keyCode === 65) { 
        rotation = -60
    } 
    
    if (e.keyCode == 39 || e.keyCode === 68) { 
        rotation = 60
    }    
})  

canvas.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!started) {
        started = true 
        document.getElementById("intro").remove()
    } else {
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position) 
    }
})
 
window.addEventListener("deviceorientation", (e) => {
    rotation = e.gamma
}, false)

document.body.addEventListener("touchmove", (e) => { 
    e.preventDefault()
    e.stopPropagation()
})
 
scene.beforeRender = () => {    
    if (!started) { 
        camera.radius += (10- camera.radius ) / 60
        camera.alpha += (-Math.PI / 2- camera.alpha) / 60 
        cameraTarget.position.z += (0 - cameraTarget.position.z) / 120 
    } else { 
        let removed = []   
        let velocity = player.physicsImpostor.getLinearVelocity().clone() 

        velocity.z = player.position. y < -1 ? 0 : speed
        velocity.x = rotation / 90 * 4
        rotation *= .95
        player.physicsImpostor.setLinearVelocity(velocity)

        cameraTarget.position.z += (player.position.z + 5 - cameraTarget.position.z) / 30
        camera.radius += (10- camera.radius ) / 60
        camera.alpha += (-Math.PI / 2- camera.alpha) / 60 

        for (let block of blocks) {
            if (player.position.z >= block.position.z + block.depth + 4) {
                removed.push(block) 
            }  
        }  

        for (let block of removed) {   
            blocks = blocks.filter(b => b !== block) 
            
            block.dispose() 
            makeBlock() 
        } 
    }
}

engine.runRenderLoop(() => {   
    scene.render()  
})
