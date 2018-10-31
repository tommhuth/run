import "babel-polyfill"
 
import { Engine, Scene, HemisphericLight, DirectionalLight, PhysicsImpostor, CannonJSPlugin, ArcRotateCamera, PhysicsRadialImpulseFalloff } from "babylonjs"
import { Color3, Color4, Vector3, Axis } from "babylonjs"
import { MeshBuilder, StandardMaterial, SceneLoader, PhysicsHelper } from "babylonjs"   
import uuid from "uuid"
   
const WIDTH = 4.5
const HEIGHT = 3
const DEPTH = 4
const SPEHER_SIZE = .35
const MAX_JUMP_DISTANCE = 4

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
        illegalNext: [PathType.RUINS, PathType.GAP],
        isLegal() {
            return blocks.every(i => i.type !== PathType.RUINS)
        }
    }
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
const light = new DirectionalLight("directionalLight", new Vector3(4.5, -5.1, 4.1), scene) 
const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(3, 2, 1), scene) 
const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)
const cameraTarget = MeshBuilder.CreateBox("cameraTarget", { size: .1}, scene)
const camera = new ArcRotateCamera("camera", -2, Math.PI / 3.5, 10, cameraTarget, scene) 
const physicsPlugin = new CannonJSPlugin(false, 8) 
const ground = MeshBuilder.CreateGround(1, { width: 180, height: 180, subdivisions: 1}, scene)

const waterMaterial = new StandardMaterial()
waterMaterial.diffuseColor = Color3.Blue()
waterMaterial.roughness = 1

ground.material = waterMaterial
ground.position.y = -3
 
const models = {
    rock: null,
    rockFace: null,
    stone: null,
}
const baseMaterial = new StandardMaterial()
baseMaterial.diffuseColor = new Color3(1,1,1)
baseMaterial.roughness = 1

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

scene.autoClear = false
scene.autoClearDepthAndStencil = false
scene.blockMaterialDirtyMechanism = true

light.position.x = 0
light.position.y = 0
light.position.z = 0
light.diffuse = Color3.Yellow()
light.intensity = 1

hemisphere.diffuse = Color3.Red()  
hemisphere.groundColor = Color3.Blue()
 
cameraTarget.isVisible = false 
cameraTarget.position.z = 0

scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
scene.getPhysicsEngine().setTimeStep(1 / 45)
scene.fogMode = Scene.FOGMODE_NONE
scene.fogColor = Color3.White()
scene.fogDensity = .055
scene.clearColor = new Color4(1, 1, 1, 1)
  
player.position.y = 5
player.position.x = 0
player.position.z = 3
player.material = new StandardMaterial(uuid.v4(), scene)
player.material.diffuseColor = Color3.Red()  
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)
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
        top.rotate(Axis.Y, top.rotation.x + .075) 

        if (top.intersectsMesh(player, false, true)) {
            score++ 

            setTimeout(() => top.dispose(false, true), 1)
             
            console.info("score", score, "of", potentialScore)
        }
    }) 
 
    potentialScore++ 

    return top
}

function makeRuins(){
    const width = WIDTH  * 3
    const height = HEIGHT  
    const depth = DEPTH  * 4
    const group = makeGroup() 
    const path = clone(randomList("path"))
    const previousBlock = blocks[blocks.length -1]
    const wasLastFull = previousBlock && previousBlock.type === PathType.FULL
    
    group.position.x = 0
    group.position.y = 0
    group.position.z = getZPosition(depth) + (wasLastFull ? -.75 : 0)

    for (let k = 0; k < 2; k++) {
        for (let i = 0; i < 2; i++) {
            let foot = clone("pillarFoot")
            let xPosition = (width/2 - 3.5) * (k === 0 ? -1 : 1)
            let zPosition = i * (foot.depth + 2) - (foot.depth + 1.5)
            let isStatic = Math.random() > .4
            let isSecondStatic = isStatic && Math.random() > .5
    
            foot.position.set(xPosition, foot.height/2, zPosition)
            foot.rotate(Axis.Y, getRandomRotation())
            foot.physicsImpostor = new PhysicsImpostor(foot, PhysicsImpostor.CylinderImpostor, { mass: Math.random() > .5 }, scene) 
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
                    mass: (isStatic && j === 0) || (isSecondStatic && j === 1) ? 0 : 200 
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

            explode(new Vector3(-7, 2, group.position.z), 7, 15000, 0, true)
            explode(new Vector3(7.5, 2, group.position.z), 7, 15000, 500, true)

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
    const lastBlock = blocks[blocks.lenght-1]
    const lastWasIsland = lastBlock && lastBlock.type === PathType.HIGH_ISLAND

    const islandSize =  Math.max((WIDTH - .5) *  Math.random(), 2.25)
    const gapSize = Math.max(MAX_JUMP_DISTANCE * Math.random(), 2)
    const gap1 = lastWasIsland ? 0 : gapSize
    const gap2 = gapSize 
    const height = HEIGHT + Math.random() * 2.5
    const depth = islandSize + gap1 + gap2  
    const group = makeGroup()
    const island = clone(randomList("island", "island2", "island3")) 
   
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
    const depth = DEPTH  + Math.random()
    const group = makeGroup() 
    const path = clone(randomList("path", "path2"))
    const previousBlock = blocks[blocks.length -1]
    const wasLastFull = previousBlock && [PathType.FULL, PathType.RUINS].includes(previousBlock.type)
 
    resize(path, width, height, depth) 
     
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
    makeBlock(PathType.FULL, false)                   
    makeBlock(PathType.FULL, false)                   
    makeBlock(PathType.FULL, true)                 
    makeBlock(PathType.RUINS, false)                  
    makeBlock(PathType.FULL, true)                      
    makeBlock(PathType.FULL, true)                      
    makeBlock(PathType.FULL, true)                      
    makeBlock(PathType.FULL, true)                      
    makeBlock(PathType.FULL, true)                      
    makeBlock(PathType.FULL, true)                      

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
 
    if (!started) { 
       // camera.radius += (10- camera.radius ) / 60
      //  camera.alpha += (-Math.PI / 2- camera.alpha) / 160 
       // cameraTarget.position.z += (0 - cameraTarget.position.z) / 120 
    } else {
        let removed = []   

        for (let block of blocks) {
            block.beforeRender && block.beforeRender()

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
    camera.radius += (13 - camera.radius ) / 30
    camera.alpha  += (-Math.PI / 2 - camera.alpha) / 60  
}

engine.runRenderLoop(() => {   
    scene.render()  
})
