import "babel-polyfill"
 
import { Engine, Scene, HemisphericLight, DirectionalLight, PhysicsImpostor, CannonJSPlugin, ArcRotateCamera, PhysicsRadialImpulseFalloff, Mesh } from "babylonjs"
import { Color3, Vector3, Axis } from "babylonjs"
import { MeshBuilder, StandardMaterial, SceneLoader, PhysicsHelper, Angle, PhysicsUpdraftMode, ParticleSystem, Texture, Color4 } from "babylonjs"  
import uuid from "uuid"
   
const WIDTH = 4.5
const HEIGHT = 6
const DEPTH = 4
const SPEHER_SIZE = .35
const MAX_JUMP_DISTANCE = 3.5

let startAlpha = Math.PI / 2 // LEFT RIGHT
let startBeta =  1.55 /// UP DOWN
let startRadius = 0

let targetSpeed = 60
let logoOpacity = 1
 

let targetAlpha = .75 // Math.PI / 2 + Math.PI / 4  left/right => left === closer to zero
let targetBeta = 0 //Math.PI /2 - .25  // up down,,, up === closer to zero
let targetRadius = 22 
let targetY = 0
let targetX = 0
let targetZ = 8
let fogEnd = 55
let fogStart = 19

const PathType = {
    FULL: "full",
    BRIDGE: "bridge",
    GAP: "gap",
    ISLAND: "island",
    RUINS: "ruins",
    HIGH_ISLAND: "high-island",
}
const PathSettings = {
    [PathType.HIGH_ISLAND]: { 
        illegalNext: [PathType.GAP, PathType.RUINS, PathType.ISLAND, PathType.HIGH_ISLAND, PathType.BRIDGE],
        isLegal() {
            return true
        }
    },
    [PathType.FULL]: {
        illegalNext: [],
        isLegal() {
            return true
        }
    }, 
    [PathType.ISLAND]: {
        illegalNext: [PathType.BRIDGE, PathType.GAP, PathType.HIGH_ISLAND, PathType.RUINS],
        isLegal() {
            return true
        }
    },
    [PathType.GAP]: {
        illegalNext: [PathType.GAP, PathType.BRIDGE, PathType.ISLAND, PathType.HIGH_ISLAND, PathType.RUINS],
        isLegal() {
            return true
        }
    },
    [PathType.BRIDGE]: {
        illegalNext: [PathType.GAP, PathType.ISLAND, PathType.HIGH_ISLAND, PathType.RUINS],
        isLegal() {
            return true
        }
    },
    [PathType.RUINS]: {
        illegalNext: [PathType.RUINS, PathType.GAP, PathType.ISLAND, PathType.HIGH_ISLAND, PathType.BRIDGE],
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
const redMaterial = new StandardMaterial()
const yellowMaterial = new StandardMaterial()
const blackMaterial = new StandardMaterial()

redMaterial.diffuseColor = Color3.Red()

blackMaterial.diffuseColor = new Color3(.1, .1, .1)

yellowMaterial.diffuseColor = Color3.Yellow()

baseMaterial.diffuseColor = Color3.White()
baseMaterial.roughness = .5

plantMaterial.diffuseColor = new Color3(209/255, 252/255, 241/255)
///plantMaterial.emissiveColor = new Color3(22/255, 239/255, 255/255)
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
cameraTarget.position.z = -18
cameraTarget.position.y = 30

scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
scene.getPhysicsEngine().setTimeStep(1 / 45)
scene.fogMode = Scene.FOGMODE_LINEAR
scene.fogColor = Color3.White()
scene.fogStart = 6
scene.fogEnd = fogEnd
scene.fogStart = fogStart
scene.clearColor = Color3.White()
  
player.position.y = 50
player.position.x = 0
player.position.z = 0 
player.material = blackMaterial
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
        let scalingY = Math.max(Math.random() * 1.5 + .5, .85)

        rock.scaling.set(scaling, scalingY, scaling)
        rock.rotate(Axis.Y, getRandomRotation())
        rock.rotate(Axis.X, Math.random() * .25 * flip())
        rock.rotate(Axis.Z, Math.random() * .25 * flip())
        rock.position.x = (width/2 + Math.random() * 8) * flip()
        rock.position.y = 0
        rock.position.z = depth * Math.random() / 2 * flip()
        rock.parent = group
    }

    group.position.y = -DEPTH - .75

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

                switch (mesh.id) {
                    case "plant":
                    case "leaf":
                        mesh.material = plantMaterial
                        break 
                    case "logo":
                        mesh.material = blackMaterial
                        break
                    case "coin":
                        mesh.material = blackMaterial
                        break
                    default:
                        mesh.material = baseMaterial
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
        if (previousBlock.type === type && type === PathType.ISLAND) {
            return previousBlock.position.z + previousBlock.islandSize/2
        }

        return previousBlock.position.z + previousBlock.depth / 2 + currentDepth / 2  
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

function makeGroup(visible = false){
    const mesh = MeshBuilder.CreateGround("", { width: 1, height: 1, subdivisions: 1 }, scene)

    if (visible) { 
        mesh.visibility = .0001
    } else {
        mesh.isVisible = false 
    }
            
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
        case PathType.ISLAND:
            return makeIsland(...params) 
        case PathType.RUINS:
            return makeRuins(...params)   
        case PathType.HIGH_ISLAND:
            return makeHighIsland(...params)  
    }
} 

let logo

function getLogoScale(){
    if (window.matchMedia("(min-width: 1900px)").matches) {
        return 4
    }
    if (window.matchMedia("(min-width: 1600px)").matches) {
        return 3
    }
    if (window.matchMedia("(min-width: 1300px)").matches) {
        return 2.5
    }
    if (window.matchMedia("(min-width: 1000px)").matches) {
        return 2.35
    }
    if (window.matchMedia("(min-width: 800px)").matches) {
        return 2
    }
    if (window.matchMedia("(min-width: 400px)").matches) {
        return 1.75
    }

    return 1.35
}

function makeLogo(){
    logo = models.logo.clone()
    let s = getLogoScale() 

    logo.scaling.set(s, s, s)
    //logo.billboardMode = Mesh.BILLBOARDMODE_ALL
    logo.rotate(Axis.X, Math.PI/2)
    logo.rotate(Axis.Y, -Math.PI/2)
    logo.position.z = 8
    logo.position.x = 0
    logo.position.y = 1

}

function makeRuins(collapsable = true){
    const width = WIDTH  * 2 + 2
    const height = HEIGHT  
    const depth = DEPTH  * 2
    const group = makeGroup() 
    const path = clone(randomList("path"))
    const path2 = clone("path2")
    const path3 = clone("path2")
    const previousBlock = blocks[blocks.length -1]
    const wasLastFull = previousBlock && previousBlock.type === PathType.FULL
    const rocks = makeRocks(Math.random() * 4 + 1, width - 3, depth)
 
    rocks.parent = group 
    
    group.position.x = 0
    group.position.y = 0
    group.position.z = getZPosition(depth) + (wasLastFull ? -.75 : 0)

    for (let k = 0; k < 2; k++) {
        for (let i = 0; i < 2; i++) {
            let foot = clone("pillarFoot")
            let xPosition = (width/2 - 2.25) * (k === 0 ? -1 : 1)
            let zPosition = i * (foot.depth + 2) - (foot.depth/2) - .5
            let isStatic = Math.random() > .4 
            let isSecondStatic = isStatic && Math.random() > .2
    
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
                    mass: (isStatic && j === 0) || (isSecondStatic && j === 1) || !collapsable ? 0 : 200 
                }, scene) 
     
                pillar.parent = group
    
                accu += height  
            }
        }
    }
    
    resize(path, width, height, depth)  
    resize(path2, 4, height, 6)
    resize(path3, 4, height + 2, 4)

    path2.rotate(Axis.Y, Math.random() * .15 * flip())
    path2.position.x = 4.5 + Math.random() * 1.5
    path2.position.y = -height/2 - Math.random() * 2
    path2.position.z = Math.random() * 3 * flip()
    
    path3.rotate(Axis.Y, Math.random() * .15 * flip())
    path3.position.x = -6
    path3.position.y = -height/2  - Math.random() * 3
    path3.position.z = 0  

    path2.parent = group
    path3.parent = group
     
    path.rotate(Axis.Y, Math.random() * .15 * flip())
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
    const plant = makePlant(Math.random() * 3 + 4, true)
    const plantScale = Math.random() * .35 + .4
    const rocks = makeRocks(Math.random() * 4 + 2, 1, depth)

    rocks.parent = group

    plant.scaling.set(plantScale, plantScale, plantScale)
    plant.position.x = xPosition + flip() * (Math.random() * 3 + 2)
    plant.position.z = (Math.random() * (depth/2 - 2)) * flip()
    plant.parent = group

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

    for (let i = 0; i < depth + 1; i++) {
        const block = clone(randomList("bridgeMid", "bridgeMid2", "bridgeMid3"))

        resize(block, width, height, width)

        block.rotate(Axis.Y, getFlipRotation())
        block.rotate(Axis.Z, getFlipRotation())
        block.rotate(Axis.X, getFlipRotation())
        block.position.y = -width/2
        block.position.x = xPosition
        block.position.z = i - depth/2 + width/2 - .5
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
        isCollapsable: Math.random() > .5,
        collapseTriggerDistance: group.position.z - (Math.random() * 3 + 12),
        get position() {
            return group.position
        },
        beforeRender() { 
            if (player.position.z < this.collapseTriggerDistance || !this.isCollapsable) {
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

function makeIsland(forcePlant = false) {   
    const lastBlock = blocks[blocks.lenght-1]
    const lastWasIsland = lastBlock && lastBlock.type === PathType.ISLAND

    const islandSize =  Math.max((WIDTH - .5) *  Math.random(), 2.25)
    const gapSize = Math.max(MAX_JUMP_DISTANCE  * Math.random(), 2.5)
    const gap1 = lastWasIsland ? 0 : gapSize
    const gap2 = gapSize 
    const height = HEIGHT
    const depth = islandSize + gap1 + gap2  
    const group = makeGroup()
    const island = clone(randomList("island", "island2", "island3")) 
    const plants = makePlants(Math.floor(Math.random() * 3) + 1)
    const platsXSide = flip()
   
    resize(island, islandSize, height, islandSize)
  
    group.position.x = 0
    group.position.y = 0

    if (lastWasIsland) {
        group.position.z = getZPosition(0, PathType.ISLAND) + islandSize/2
    } else { 
        group.position.z = getZPosition(0, PathType.ISLAND) + islandSize/2 + gap1
    }
    
    island.rotate(Axis.Y, Math.random() * Math.PI * flip())
    island.position.set(Math.random() * 1.5 * flip(), -height / 2 - .5, 0) 
    island.physicsImpostor = new PhysicsImpostor(island, PhysicsImpostor.CylinderImpostor, { mass: 0 }, scene)
    island.parent = group

    plants.parent = group
    plants.rotate(Axis.Y, getRandomRotation())
    plants.position.set(island.position.x + (islandSize + Math.random() * 1.5 + .5) * platsXSide, -DEPTH, 0)

    if (forcePlant || Math.random() > .5) { 
        const plants2 = makePlants(Math.floor(Math.random() * 3) + 1)

        plants2.parent = group
        plants2.rotate(Axis.Y, getRandomRotation())
        plants2.position.set(island.position.x + (islandSize + Math.random() * 1.5 + .5) * -platsXSide, -DEPTH, 0)
    }
  
    blocks.push({ 
        height,
        depth,
        gap1,
        gap2,islandSize,
        main: group,
        type: PathType.ISLAND,
        get position() {
            return group.position
        },
        dispose() {
            group.dispose() 
        }
    })    
}

function makePlant(leafCount = 6, moves = true, radius = 360){
    let group = makeGroup(moves) 
    let leafs = []

    for (let i = 0; i < leafCount; i++) { 
        let leaf = clone("leaf")
        let perLeaf = radius / leafCount
        let scale =  Math.random() * .75 + .5
        let rotation = Angle.FromDegrees(perLeaf * i)

        leaf.position.x = Math.random() * .25 * flip()   
        leaf.position.z = Math.random() * .25 * flip() 
        leaf.position.y = Math.random() * -.5
        leaf.scaling.set(scale, scale, scale)
        leaf.rotate(Axis.Y, rotation.radians()) 
        leaf.rotate(Axis.Z, Math.random() / 100 * flip()) 
        leaf.parent = group

        leaf.time = Math.random() / 100 * flip()

        leafs.push(leaf)
    }

    if (moves) { 
        group.registerBeforeRender(() => {
            for (let leaf of leafs) {
                leaf.time += .01
                leaf.addRotation(0, 0, Math.sin(leaf.time) / 2000)
            }
        })
    }

    group.rotate(Axis.Y, getRandomRotation())
    group.position.y = -DEPTH - 1

    return group
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
    path.rotate(Axis.Y, Math.random() * .2 * flip())
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
    const group = makeGroup()
    const depth = Math.max(Math.random() * MAX_JUMP_DISTANCE, 2)  
    
    group.position.z = getZPosition(depth) 
    
    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth, 
        type: PathType.GAP,
        get position() {
            return group.position
        },
        dispose() {
            group.dispose()
        }
    })   
}
 
function makeHighIsland() {  
    const group = makeGroup()
    const depth =  MAX_JUMP_DISTANCE * 4.5
    const islands = []
    const coinCount = 5
    let coins = []

    for (let i = 0; i < 3; i++) {
        const island = clone(randomList("island", "island2"))
        const height = HEIGHT + i
        const diameter = 2 + Math.random()
        const rock = clone(randomList("rock", "rock2"))

        resize(rock, diameter + 1.5, diameter + 2, diameter + 1.5)
        resize(island, diameter, height, diameter)

        island.diameter = diameter
        island.height = height
        island.rotate(Axis.Y, getRandomRotation()) 
        island.position.y = -height/2 + (i/2 + .5)
        island.position.x = i === 0 ? 0 : Math.random() * flip()
        island.position.z = -depth/2 + i * (MAX_JUMP_DISTANCE + diameter/2) + diameter/2 + 1
        island.physicsImpostor = new PhysicsImpostor(island, PhysicsImpostor.CylinderImpostor, { mass: 0 }, scene)
        island.parent = group

        rock.rotate(Axis.Y, getRandomRotation()) 
        rock.position = island.position.clone()
        rock.position.y = -HEIGHT/2 - 2
        rock.parent = group

        if (Math.random() < .5) { 
            const plant = makePlant(Math.random() * 4 + 2, false)
            const scale = Math.random() * .4 + .4
            
            plant.rotate(Axis.Y, getRandomRotation()) 
            plant.position.z = island.position.z
            plant.position.y = -HEIGHT/2 - 2
            plant.position.x = island.position.x + (4 * flip())
            plant.parent = group 
            plant.scaling.set(scale, scale, scale)

            if (Math.random() < .5) {
                const plant2 = makePlants(Math.random() * 3)

                plant2.rotate(Axis.Y, getRandomRotation()) 
                plant2.position = plant.position.clone()
                plant2.position.x *= -1.25
                plant2.position.y += 1
                plant2.parent = group
            }
        }

        islands.push(island)
    }

    for (let i = 0; i < coinCount; i++) {
        const coin = clone("coin")
        const y = Math.cos(Math.PI / coinCount * i) 
        const island = islands[islands.length - 1]
        
        resize(coin, .3, .6, .3)
 
        coin.time = i * .01
        coin.position.y = y + island.position.y + island.height / 2
        coin.position.z = island.position.z + island.diameter / 2 + i + .5
        coin.position.x = 0
        coin.parent = group

        coins.push(coin)
    }
   
    group.position.z = getZPosition(depth) 
    group.position.y = 0
    group.position.x = 0
    
    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth, 
        type: PathType.HIGH_ISLAND,
        get position() {
            return group.position
        },
        beforeRender() {
            for (const coin of coins) {
                const distance = Vector3.Distance(coin.getAbsolutePosition(), player.getAbsolutePosition())

                coin.rotate(Axis.Y, coin.rotation.y + .075)

                if (distance < .5 ){
                    score++
                    console.log("score", score)
                    coin.dispose()
                    coins = coins.filter(i => i !== coin)
                }
            }
        },
        dispose() { 
            group.dispose() 
        }
    })   
}
 
function init() {  
    // setup
    makeLogo()
    makeFog()    

    // init logo area
    makeStart() 
    // actual game path 
    makeBlock(PathType.FULL, true)    
    makeBlock(PathType.FULL, true)    
    makeBlock(PathType.FULL, true)    
    makeBlock(PathType.FULL, true)    
    makeBlock(PathType.RUINS, false)  
    makeBlock(PathType.FULL, true)      
    makeBlock(PathType.RUINS, false)    
    makeBlock(PathType.FULL, true)       
    makeBlock(PathType.ISLAND, true)     
    makeBlock(PathType.FULL, true)          
    makeBlock(PathType.ISLAND, false)        
}

function makeStart(){
    const group = makeGroup()
    const depth = 30
    const size = 4
    const height = HEIGHT
    const island1 = clone("island")
    const island2 = clone("island2")
    const island3 = clone("island3")
    const plant1 = makePlants(3)
    const plant2 = makePlants(2)
    const plant3 = makePlant(7, false)
    const plant4 = makePlant(6, false)
    const plant5 = makePlant(6, false)
    const rocks = [
        new Vector3(3, -DEPTH - 1, 1),
        new Vector3(-3, -DEPTH - 1, 4),
        new Vector3(1, -DEPTH - 1, 9),
        new Vector3(-8, -DEPTH - 1, 3),
        new Vector3(4, -DEPTH - 1, 6),
        new Vector3(1, -DEPTH - 1, 1),
        new Vector3(1, -DEPTH - 1, 18),
        new Vector3(4, -DEPTH -1 , 12),
        new Vector3(-12, -DEPTH - 1, 5),
        new Vector3(8, -DEPTH - 1, 2),
        new Vector3(12, -DEPTH - 1, 5),
    ]

    for (let i = 0; i < rocks.length; i++) {
        const rock = clone(randomList("rock", "rock2"))
        const scale = i/rocks.length + 1

        rock.position = rocks[i]
        rock.scaling.set(scale,scale,scale)
        rock.rotate(Axis.Y, getRandomRotation())
        rock.parent = group
    }

    resize(island1, size + 1,height, size + 1)
    resize(island2, size - 1, height, size - .8)
    resize(island3, size ,height, size) 

    plant1.position.set(-7, -DEPTH, 7)
    plant1.scaling.set(1.75, 1, 1.75)
    plant1.parent = group

    plant2.position.set(8, -DEPTH, 10)
    plant2.scaling.set(1.5, 1, 1.5)
    plant2.rotate(Axis.Y, getRandomRotation()) 
    plant2.parent = group

    // UN
    plant3.position.set(4, -DEPTH - 1.5, 9)
    plant3.scaling.set(1, 1, 1)
    plant3.rotate(Axis.Y, getRandomRotation()) 
    plant3.parent = group

    //RU
    plant4.position.set(-3, -DEPTH - 2 , 2)
    plant4.scaling.set(1, 1, 1)
    plant4.rotate(Axis.Y, getRandomRotation()) 
    plant4.parent = group

    plant5.position.set(11, -DEPTH, 9)
    plant5.scaling.set(1, 1, 1)
    plant5.rotate(Axis.Y, getRandomRotation()) 
    plant5.parent = group

    island1.position.set(.5, -height + 1, 5) 
    island2.position.set(-2, -height + .5, 8) 
    island3.position.set(1, -height, 12) 

    island2.rotate(Axis.X, .1)
    island2.rotate(Axis.Z, .1)

    island1.parent = group
    island2.parent = group
    island3.parent = group

    rocks.parent = group
    
    group.position.z = getZPosition(depth) 
    
    blocks.push({
        width: WIDTH,
        height: HEIGHT,
        depth, 
        type: PathType.GAP,
        get position() {
            return group.position
        },
        dispose() {
            group.dispose()
        }
    })
}

function start() { 
    targetAlpha = -Math.PI / 2 
    targetBeta = Math.PI / 3.5
    targetRadius = 12
    targetSpeed = 30  
    targetY = 0
    fogEnd = 30
    fogStart = 14

    player.position.y = 4
    player.position.z = 16
    player.physicsImpostor.setMass(1)

    logoOpacity = 0

    //logo.billboardMode = Mesh.BILLBOARDMODE_NONE
    //logoDistance = -2
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

            if (player.position.z >= block.position.z + block.depth + 4 && player.position.z > 30) {
                removed.push(block) 
            }  
        }  

        for (let block of removed) {   
            blocks = blocks.filter(b => b !== block) 
            
            block.dispose() 
            makeBlock() 
        } 
    }

    /*
    let target = camera.getFrontPosition(logoDistance)
    
    logo.position.x += (target.x - logo.position.x) / 7
    logo.position.y += (target.y - logo.position.y) / 7
    logo.position.z += (target.z - logo.position.z) / 7*/

    logo.visibility += (logoOpacity - logo.visibility) / 16
    logo.position.z += ((logoOpacity === 1 ? 8 : 32) - logo.position.z) / 16

    if (started) {
        cameraTarget.position.z += (player.position.z - cameraTarget.position.z  + 4) / 16
    } else {
        cameraTarget.position.z += (targetZ - cameraTarget.position.z) / targetSpeed * 2
    }

    cameraTarget.position.y += (targetY - cameraTarget.position.y) / targetSpeed * 2
    cameraTarget.position.x += (targetX - cameraTarget.position.x) / targetSpeed * 2
    camera.radius += (targetRadius - camera.radius ) / targetSpeed / 2
    camera.alpha += (targetAlpha - camera.alpha) / targetSpeed  
    camera.beta += (targetBeta - camera.beta) / targetSpeed  

    scene.fogEnd += (fogEnd - scene.fogEnd) / 30 
    scene.fogStart += (fogStart - scene.fogStart) / 30 
}

engine.runRenderLoop(() => {   
    scene.render()  
})
