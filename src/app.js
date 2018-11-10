import "babel-polyfill"
 
import { Engine, Scene, HemisphericLight, DirectionalLight, PhysicsImpostor, CannonJSPlugin, ArcRotateCamera, PhysicsRadialImpulseFalloff, Mesh } from "babylonjs"
import { Color3, Color4, Vector3, Axis } from "babylonjs"
import { MeshBuilder, StandardMaterial, SceneLoader, PhysicsHelper } from "babylonjs"  
import uuid from "uuid"
   
const WIDTH = 4.5
const HEIGHT = 6
const DEPTH = 4
const SPEHER_SIZE = .35
const MAX_JUMP_DISTANCE = 4

let startAlpha = Math.PI / 2 // LEFT RIGHT
let startBeta =  1.55 /// UP DOWN
let startRadius = 35

let targetSpeed = 120

let targetAlpha = Math.PI / 2 + Math.PI / 4  
let targetBeta = 1.2  
let targetRadius = 25 
let targetY = 0
let fogEnd = 56

const PathType = {
    FULL: "full",
    BRIDGE: "bridge",
    GAP: "gap",
    HIGH_ISLAND: "high-island",
    RUINS: "ruins"
}
const PathSettings = {
    [PathType.FULL]: {
        illegalNext: [],
        isLegal() {
            return true
        }
    }, 
    [PathType.HIGH_ISLAND]: {
        illegalNext: [PathType.BRIDGE, PathType.GAP],
        isLegal() {
            return true
        }
    },
    [PathType.GAP]: {
        illegalNext: [PathType.GAP, PathType.BRIDGE, PathType.HIGH_ISLAND],
        isLegal() {
            return true
        }
    },
    [PathType.BRIDGE]: {
        illegalNext: [PathType.GAP, PathType.HIGH_ISLAND],
        isLegal() {
            return true
        }
    },
    [PathType.RUINS]: {
        illegalNext: [PathType.RUINS, PathType.GAP, PathType.HIGH_ISLAND],
        isLegal() {
            return blocks.every(i => i.type !== PathType.RUINS)
        }
    },
}
const models = {
    rock: null,
    rockFace: null,
    stone: null,
    // blah
}

let score = 0
let potentialScore = 0
let blocks = []   
let speed = 4
let rotation = 0
let loading = true
let started = false  
let gameOver = false

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("directionalLight", new Vector3(9, -6, -4), scene) 
const light2 = new DirectionalLight("directionalLight", new Vector3(-9, -6, 4), scene) 
const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(0, 0, 0), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const cameraTarget = MeshBuilder.CreateBox("cameraTarget", { size: .1 }, scene)
const camera =  new ArcRotateCamera("camera", startAlpha, startBeta, startRadius, cameraTarget, scene) 
const physicsPlugin = new CannonJSPlugin(false, 8) 
const ground = makeGroup()

const plantMaterial = new StandardMaterial()
const baseMaterial = new StandardMaterial()

baseMaterial.diffuseColor = Color3.White()
baseMaterial.roughness = .5

plantMaterial.diffuseColor = new Color3(209/255, 252/255, 241/255)
plantMaterial.roughness = .1
 

engine.renderEvenInBackground = false
engine.setHardwareScalingLevel(.75)

scene.autoClear = false
scene.autoClearDepthAndStencil = false
scene.blockMaterialDirtyMechanism = true
 
// light

light.diffuse = Color3.White()
light.intensity = .5

light2.diffuse = Color3.White()
light2.intensity = .2

hemisphere.diffuse = new Color3(209/255, 242/255, 1) 
hemisphere.groundColor = Color3.White() 
hemisphere.intensity = .5
 
cameraTarget.isVisible = false 
cameraTarget.position.z = 0
cameraTarget.position.y = 30

scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
scene.getPhysicsEngine().setTimeStep(1 / 45)
scene.fogMode = Scene.FOGMODE_LINEAR
scene.fogColor = Color3.White()
scene.fogStart = 6
scene.fogEnd = fogEnd
scene.clearColor = Color3.White()
  
player.position.y = 50
player.position.x = 0
player.position.z = DEPTH 
player.material = new StandardMaterial(uuid.v4(), scene)
player.material.diffuseColor = Color3.Blue()  
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
player.registerBeforeRender(() => { 
    if (loading || gameOver || !started) {
        return
    }

    let velocity = player.physicsImpostor.getLinearVelocity().clone() 
 

    velocity.z = player.position. y < -1 ? 0 : speed
    velocity.x = rotation / 90 * 4
    rotation *= .95
    player.physicsImpostor.setLinearVelocity(velocity)

    ground.position.z = player.position.z
})

function makeRocks(amount, width, depth){
    let group = makeGroup()

    for(let i = 0; i < amount; i++) {
        let rock = clone(randomList("rock", "rock2"))
        let scaling = Math.random() * 1.5 + .5

        rock.scaling.set(scaling, Math.random() * 1 + .5, scaling)
        rock.rotate(Axis.Y, getRandomRotation())
        rock.rotate(Axis.X, Math.random() * .5 * flip())
        rock.rotate(Axis.Z, Math.random() * .5 * flip())
        rock.position.x = (width/2 + Math.random() * 8) * flip()
        rock.position.y = 0
        rock.position.z = depth * Math.random() / 2 * flip()
        rock.parent = group
    }

    return group
}
 
function makeFog(){
    const max = 10
    const fogMaterial = new StandardMaterial()
    const wrap = MeshBuilder.CreateBox("", { size: 200, sideOrientation: Mesh.BACKSIDE }, scene)
  
    wrap.material = fogMaterial 
    wrap.position.set(0,0,0)
    wrap.parent = ground

    fogMaterial.diffuseColor = Color3.White() 
    fogMaterial.roughness = 0
    fogMaterial.emissiveColor = Color3.White()
    fogMaterial.specularPower = 0
    fogMaterial.fogEnabled = true

    for (let i = 0; i < max; i++) { 
        const layer = MeshBuilder.CreateGround(1, { width: 30, height: 50, subdivisions: 1 }, scene)

        layer.material = fogMaterial
        layer.position.x = 0
        layer.position.z = 0
        layer.position.y =  -i * .15
        layer.visibility = .25

        layer.parent = ground
    }

    ground.position.y = -DEPTH  
}
 
function load(){  
    let allResoucers = Promise.all([
        SceneLoader.LoadAssetContainerAsync("world.babylon") 
    ])

    allResoucers
        .then(scenes => {
            let meshes = [] 

            for (let scene of scenes) {
                meshes.push(...scene.meshes)
            }

            return meshes
        })
        .then(meshes => { 
            for (let mesh of meshes) { 
                let { extendSize } = mesh.getBoundingInfo().boundingBox

                mesh.width = extendSize.x  * 2
                mesh.height = extendSize.y * 2
                mesh.depth = extendSize.z * 2
                mesh.material = baseMaterial
                mesh.convertToFlatShadedMesh() 

                if(mesh.id === "plant"){
                    mesh.material = plantMaterial
                }

                models[mesh.id] = mesh
            } 

            init()    
            loading = false
        })
        .catch(e => {
            console.error(e)
        })
}
 
load()

function getZPosition(currentDepth = 0, type) {
    const previousBlock = blocks[blocks.length - 1]

    if (previousBlock) {
        if (previousBlock.type === type && type === PathType.HIGH_ISLAND) {
            return previousBlock.position.z + previousBlock.islandSize/2
        }

        return previousBlock.position.z + previousBlock.depth / 2 +   currentDepth / 2  
    }

    return 0
}

function flip() {
    return Math.random() > .5 ? 1 : -1
}

function clone(model) {
    let instance = models[model].createInstance()

    instance.width = models[model].width
    instance.height = models[model].height
    instance.depth = models[model].depth

    return instance
}

function resize(mesh, width, height, depth) {
    mesh.scaling.set(1/mesh.width * width, 1/mesh.height * height, 1/mesh.depth * depth)
}
  
function randomList(...args) {
    return args[Math.floor(Math.random() * args.length)]
}

function makeGroup(){
    const mesh = MeshBuilder.CreateGround("", { width: 1, height: 1, subdivisions: 1 }, scene)

    mesh.isVisible = false 
            
    return mesh
}

function getRandomRotation(){
    return Math.PI * 2 * Math.random() * flip()
}

function getRandomBlock(){
    let types = Object.values(PathType) 
  
    return types[Math.floor(Math.random() * types.length)]
}

function makeBlock(forceType, ...params) { 
    let type = forceType || getRandomBlock()
    let previousBlock = blocks[blocks.length - 1]

    if (previousBlock && !forceType) {  
        while (!PathSettings[type].isLegal(type) || (PathSettings[previousBlock.type].illegalNext.length && PathSettings[previousBlock.type].illegalNext.includes(type))) {
            console.log("cant use", type, PathSettings[type].isLegal(type))
            type = getRandomBlock()
        }
    } 

    switch (type) {
        case PathType.FULL:
            return makeFull(...params)
        case PathType.GAP:
            return makeGap(...params)
        case PathType.BRIDGE:
            return makeBridge(...params)
        case PathType.HIGH_ISLAND:
            return makeHighIsland(...params) 
        case PathType.RUINS:
            return makeRuins(...params)  
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
    
    material.diffuseColor = Color3.Blue()
    material.emissiveColor = new Color3(0, .2, .8)

    top.material = material
    top.convertToFlatShadedMesh()
    bottom.convertToFlatShadedMesh() 
    bottom.material = material
    bottom.parent = top
    bottom.position.y = -1
    bottom.rotate(new Vector3(1, 0, 0), Math.PI) 
    bottom.visibility = .35

    top.scaling = new Vector3(.25, .25, .25)
    top.rotate(new Vector3(0, 1, 0), index * .25)
    top.registerBeforeRender(() => { 
        top.rotate(Axis.Y, top.rotation.x + .075) 

        if (top.intersectsMesh(player, false, true)) {
            score++ 

            setTimeout(() => top.dispose(false, true), 1) 
        }
    }) 

    top.visibility = .35
 
    potentialScore++ 

    return top
}

function makeHub(){
    const width = WIDTH * 2 + 2
    const height = HEIGHT  + 1
    const depth = DEPTH * 2  + 2
    const group = makeGroup() 
    const path = clone("hub") 
    const box = clone("box")  
    const rocks = makeRocks(Math.random() * 5 + 2, width, depth)

    resize(path, width, height, depth) 
    resize(box, 5, 2, 5)

    path.position.set(0, .5, 1)
    path.physicsImpostor = new PhysicsImpostor(path, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
    path.parent = group  

    box.position.set(0, height/2  + 1, 0)
    box.parent = group

    rocks.parent = group
    rocks.position.y = -DEPTH

    group.position.x = 0
    group.position.y = -height/2
    group.position.z = 0

    blocks.push({
        width,
        height,
        depth,
        main: group,
        type: PathType.FULL,
        get position() {
            return group.position
        }, 
        dispose() {
            group.dispose()
        }
    }) 
}

function makeRuins(collapsable = true){
    const width = WIDTH  * 2 + 2
    const height = HEIGHT  
    const depth = DEPTH  * 2
    const group = makeGroup() 
    const path = clone(randomList("path"))
    const previousBlock = blocks[blocks.length -1]
    const wasLastFull = previousBlock && previousBlock.type === PathType.FULL
    const rocks = makeRocks(Math.random() * 4 + 1, width - 3, depth)
 
    rocks.parent = group
    rocks.position.y = -DEPTH
    
    group.position.x = 0
    group.position.y = 0
    group.position.z = getZPosition(depth) + (wasLastFull ? -.75 : 0)

    for (let k = 0; k < 2; k++) {
        for (let i = 0; i < 2; i++) {
            let foot = clone("pillarFoot")
            let xPosition = (width/2 - 2.25) * (k === 0 ? -1 : 1)
            let zPosition = i * (foot.depth + 2) - (foot.depth/2) - .5
            let isStatic = Math.random() > .4 
            let isSecondStatic = isStatic && Math.random() > .5
    
            foot.position.set(xPosition, foot.height/2, zPosition)
            foot.rotate(Axis.Y, getRandomRotation())
            foot.physicsImpostor = new PhysicsImpostor(foot, PhysicsImpostor.CylinderImpostor, { mass: isStatic || !collapsable ? 0 : 200 }, scene) 
            foot.parent = group
    
            let accu = foot.height
    
            for (let j = 0; j < 3; j++) { 
                let pillar = clone("pillar")
                let scaleY = Math.random() * 1 + .45
                let height = pillar.height * scaleY
    
                pillar.scaling.y = scaleY
                pillar.position.set(foot.position.x, accu + height/2, foot.position.z)
                pillar.rotate(Axis.Y, getRandomRotation())
                pillar.physicsImpostor = new PhysicsImpostor(pillar, PhysicsImpostor.CylinderImpostor, { 
                    mass: (isStatic && j === 0) || (isSecondStatic && j === 1) || !collapsable ? 0 : 200 
                }, scene) 
     
                pillar.parent = group
    
                accu += height  
            }
        }
    }
    
    resize(path, width, height, depth) 
     
    path.position.set(0, -height/2, 0)  
    path.physicsImpostor = new PhysicsImpostor(path, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    path.parent = group 
 
    blocks.push({
        width,
        height,
        depth,
        main: group,
        type: PathType.RUINS,
        get position() {
            return group.position
        },
        beforeRender() {
            if (player.position.z < group.position.z - 10) {
                return 
            } 

            explode(new Vector3(-7 - Math.random() * .5, 2 + Math.random() * .25, group.position.z), 7, 15000)
            explode(new Vector3(7.5 + Math.random() * .5, 2 + Math.random() * .25, group.position.z), 7, 15000, 500)

            this.beforeRender = null
        },
        dispose() {
            group.dispose()
        }
    }) 
}

function explode(position, radius, strength, delay = 0, debug = false) {
    setTimeout(() => {
        const physicsHelper = new PhysicsHelper(scene)  
        const explosion = physicsHelper.applyRadialExplosionForce(position, radius, strength, PhysicsRadialImpulseFalloff.Linear) 
          
        if (debug) { 
            explosion.getData().sphere.isVisible = true
            explosion.getData().sphere.visibility = .3  
        }
    }, delay)
}

function getFlipRotation(){
    const rotations = [0, Math.PI, -Math.PI, Math.PI * 2, Math.PI * -2]
    
    return rotations[Math.floor(Math.random() * rotations.length) ]
}

function makeBridge() { 
    const bridgeBlocks = []
    const depth = Math.ceil(Math.random() * (DEPTH + 2)) + 4
    const height = .65
    const width = 1
    const group = makeGroup()
    const previousBlock = blocks[blocks.length - 1]
    const lastWasBridge = previousBlock && previousBlock.type === PathType.BRIDGE  
    const xPosition = lastWasBridge ? previousBlock.bridgeX : (Math.random() * width / 2 - 1) * flip() 
    const pillarStart = clone("bridgeEnd")
    const pillarEnd = clone("bridgeEnd")

    pillarStart.scaling.z = .5
    pillarStart.position.set(xPosition, -.75, -depth/2)
    pillarStart.rotate(Axis.Y, Math.PI/2)
    pillarStart.parent = group

    pillarEnd.scaling.z = .5
    pillarEnd.position.set(xPosition, -.75, depth/2)
    pillarEnd.rotate(Axis.Y, -Math.PI/2)
    pillarEnd.parent = group
 
    group.position.x = 0
    group.position.y = 0
    group.position.z = getZPosition(depth)

    for (let i = 0; i < depth; i++) {
        const block = clone(randomList("bridgeMid", "bridgeMid2", "bridgeMid3"))

        resize(block, width, height, width)

        block.rotate(Axis.Y, getFlipRotation() * (Math.random() > .5 ? .5 : 1))
        block.rotate(Axis.Z, getFlipRotation())
        block.rotate(Axis.X, getFlipRotation())
        block.position.y = -width/2
        block.position.x = xPosition
        block.position.z = i - depth/2 + width/2
        block.physicsImpostor = new PhysicsImpostor(block, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
        block.parent = group

        bridgeBlocks.push(block)
    }

    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth,
        main: group,
        type: PathType.BRIDGE,
        bridgeX: xPosition,
        get position() {
            return group.position
        },
        beforeRender() { 
            if (player.position.z < group.position.z - 10) {
                return 
            }  

            let hasPushed = false

            for (let i = 3; i < bridgeBlocks.length - 2 && i -3 < 3; i++) {
                const bridgeBlock = bridgeBlocks[i] 
 
                bridgeBlock.physicsImpostor.setMass(10)  

                if (!hasPushed) { 
                    bridgeBlock.physicsImpostor.applyImpulse(new Vector3(0, 45, 0), player.getAbsolutePosition()) 
                    hasPushed = true 
                }    
            }

            this.beforeRender = null
        },
        dispose() {
            group.dispose() 
        }
    }) 
}

function makePlants(amount){
    const group = makeGroup()
    const basePlant = clone("plant")
    const baseScale = Math.random() + .25
    const baseR = basePlant.depth * baseScale / 2
    const rotations = []

    basePlant.rotate(Axis.Y, getRandomRotation())
    basePlant.parent = group 
    basePlant.position.set(0, 0, 0)
    basePlant.scaling.x = baseScale
    basePlant.scaling.z = baseScale

    for (let i = 0; i < amount - 1; i++) {
        const plant = clone("plant")
        const ownScale = Math.random() * .5 + .15
        const ownR = plant.depth * ownScale / 2
        const diff = Math.random() * .5
        const rotation = 360/(amount - 1) * i
        
        plant.rotate(Axis.Y, getRandomRotation())
        plant.parent = group
        plant.scaling.x = ownScale
        plant.scaling.z = ownScale
        plant.position.x = (baseR + ownR + diff) * Math.cos(rotation)
        plant.position.z = (baseR + ownR + diff) * Math.sin(rotation)
        plant.position.y = 0
        plant.i = 0
 
        rotations.push(rotation)
    }

    return group
}   

function makeHighIsland() {   
    const lastBlock = blocks[blocks.lenght-1]
    const lastWasIsland = lastBlock && lastBlock.type === PathType.HIGH_ISLAND

    const islandSize =  Math.max((WIDTH - .5) *  Math.random(), 2.25)
    const gapSize = Math.max(MAX_JUMP_DISTANCE * Math.random(), 2)
    const gap1 = lastWasIsland ? 0 : gapSize
    const gap2 = gapSize 
    const height = HEIGHT //+ Math.random() * 2.5
    const depth = islandSize + gap1 + gap2  
    const group = makeGroup()
    const island = clone(randomList("island", "island2", "island3")) 
    const plants = makePlants(Math.floor(Math.random() * 3) + 1)
   
    resize(island, islandSize, height, islandSize)
  
    group.position.x = 0
    group.position.y = 0

    if (lastWasIsland) {
        group.position.z = getZPosition(0, PathType.HIGH_ISLAND) + islandSize/2
    } else { 
        group.position.z = getZPosition(0, PathType.HIGH_ISLAND) + islandSize/2 + gap1
    }
    
    island.rotate(Axis.Y, Math.random() * Math.PI * flip())
    island.position.set(Math.random() * 2 * flip(), -height / 2 - .5, 0) 
    island.physicsImpostor = new PhysicsImpostor(island, PhysicsImpostor.CylinderImpostor, { mass: 0 }, scene)
    island.parent = group

    plants.parent = group
    plants.rotate(Axis.Y, getRandomRotation())
    plants.position.set(island.position.x + (islandSize + Math.random() * 1 + 2) * flip(), -DEPTH, 0)
  
    blocks.push({ 
        height,
        depth,
        gap1,
        gap2,islandSize,
        main: group,
        type: PathType.HIGH_ISLAND,
        get position() {
            return group.position
        },
        dispose() {
            group.dispose() 
        }
    })    
}

function makeFull(obstacle = true) { 
    const width = WIDTH  + Math.random() * 1.5
    const height = HEIGHT  
    const depth = DEPTH 
    const group = makeGroup() 
    const path = clone(randomList("path", "path2"))
    const previousBlock = blocks[blocks.length -1]
    const wasLastFull = previousBlock && [PathType.FULL, PathType.RUINS].includes(previousBlock.type)
    const rocks = makeRocks(Math.random() * 3 + 1, width - 1, depth)
 
    resize(path, width, height, depth) 
     
    rocks.parent = group
    rocks.position.y = -DEPTH

    group.position.x = 0
    group.position.y = 0
    group.position.z = getZPosition(depth) + (wasLastFull ? -.5 : 0)

    if (obstacle) { 
        const rock = clone("rock")
        const size = Math.random() * 1 + .5
        
        resize(rock, size, size, size)
        rock.position.set((width/2 - 1) * flip() * Math.random(), -Math.random() * .5 , 0)
        rock.rotation.set(getRandomRotation(), getRandomRotation(), getRandomRotation())
        rock.physicsImpostor = new PhysicsImpostor(rock, PhysicsImpostor.SphereImpostor, { mass: 0 }, scene)
        rock.parent = group 
    }

    path.position.set(0, -height/2, 0) 
    path.rotate(Axis.Y, Math.random() < .5 ? -Math.PI : 0)
    path.physicsImpostor = new PhysicsImpostor(path, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)

    path.parent = group
  
    blocks.push({
        width,
        height,
        depth: depth,
        main: group,
        type: PathType.FULL,
        get position() {
            return group.position
        },
        dispose() {
            group.dispose()
        }
    }) 
}

function makeGap() {  
    const depth = Math.max(Math.random() * DEPTH, 2) 
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
    makeFog()
    makeHub()       
    makeBlock(PathType.RUINS, false) 
    makeBlock(PathType.FULL)      
    makeBlock(PathType.BRIDGE)  
    makeBlock(PathType.BRIDGE)     
    makeBlock(PathType.FULL)     
    makeBlock(PathType.HIGH_ISLAND)     
    makeBlock(PathType.FULL)    
    makeBlock(PathType.HIGH_ISLAND)       
    makeBlock(PathType.FULL)      
    makeBlock(PathType.BRIDGE) 
}

function start() { 
    targetAlpha = -Math.PI / 2 
    targetBeta = Math.PI / 3.5
    targetRadius = 12
    targetSpeed = 30
    targetY = 0
    fogEnd = 30

    player.position.y = 4
    player.physicsImpostor.setMass(1)
}

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
        start()
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
 
scene.afterRender = () => {    
    if (loading || gameOver) {
        return 
    }
 
    if (started) { 
        let removed = []   

        for (let block of blocks) {
            if (block.beforeRender) {
                block.beforeRender()
            } 

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
    
    cameraTarget.position.z = player.position.z + 2 
    cameraTarget.position.y += (targetY - cameraTarget.position.y) / targetSpeed * 2
    camera.radius += (targetRadius - camera.radius ) / targetSpeed / 2
    camera.alpha += (targetAlpha - camera.alpha) / targetSpeed  
    camera.beta += (targetBeta - camera.beta) / targetSpeed  

    scene.fogEnd += (fogEnd - scene.fogEnd) / 30 
}

engine.runRenderLoop(() => {   
    scene.render()  
})
