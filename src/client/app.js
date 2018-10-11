import "babel-polyfill"
import "../resources/resources"

import {Engine, Scene, FreeCamera, HemisphericLight, Vector3, DirectionalLight, ShadowGenerator, MeshBuilder, StandardMaterial, Color3, PhysicsImpostor, Color4} from "babylonjs"
 
const WIDTH = 6
const HEIGHT = 10
const DEPTH = 4
const SPEHER_SIZE = .35

const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const camera = new FreeCamera("cam", new Vector3(-4, 4, 0), scene)
const light = new DirectionalLight("light", new Vector3(-4, -8, -4), scene)
const shadowGenerator = new ShadowGenerator(1024, light)
const hem = new HemisphericLight("", new Vector3(0, 1, 0), scene)

hem.diffuse = Color3.Blue()  
hem.groundColor = Color3.Green()

scene.enablePhysics()
scene.fogMode = Scene.FOGMODE_EXP2
scene.fogColor = Color3.White()
scene.fogDensity = .04
scene.clearColor = new Color4(1, 1, 1, 0)
 
light.autoUpdateExtends = false
light.shadowMaxZ = DEPTH * 5
light.shadowMinZ = -DEPTH 

let blocks = [] 

const player = MeshBuilder.CreateSphere("player", { segments: 16, diameter: SPEHER_SIZE }, scene)

player.position.y = 2
player.position.x = 2
player.material = new StandardMaterial("s", scene)
player.material.diffuseColor = Color3.Red()
player.physicsImpostor = new PhysicsImpostor(player, PhysicsImpostor.SphereImpostor, { mass: 1 })
player.physicsImpostor.physicsBody.linearDamping = .9
player.receiveShadows = true

shadowGenerator.getShadowMap().renderList.push(player)
shadowGenerator.useBlurCloseExponentialShadowMap = true
shadowGenerator.blurScale = 2
shadowGenerator.bias = .0005
shadowGenerator.normalBias = .075  

let lastWasLow = false

function makeBlock(forceLevel = false) { 
    const obstical = MeshBuilder.CreateBox("box2", { height: 1 + Math.random() * 2, width: 1, depth: 1 }, scene) 

    obstical.material = new StandardMaterial("s", scene)
    obstical.material.diffuseColor = new Color3(0, 0, 1)
    obstical.receiveShadows = true


    const box = MeshBuilder.CreateBox("box", { height: HEIGHT, width: DEPTH, depth: WIDTH }, scene)
    const color = Math.max(Math.random(), .4)
    obstical.parent = box

    box.material = new StandardMaterial("s", scene)
    box.material.diffuseColor = new Color3(color, color, color)
  

    box.position.y = Math.random() < .25 && blocks.length > 0 && !lastWasLow && !forceLevel ? -HEIGHT : -HEIGHT/2
    box.position.x = DEPTH * blocks.length

    obstical.position.y = 5
    obstical.position.x = 0
    obstical.position.z = DEPTH/2 * Math.random() * Math.random() > .5 ? -1 : 1

    obstical.physicsImpostor = new PhysicsImpostor(obstical, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene)
    box.receiveShadows = true

    
    shadowGenerator.getShadowMap().renderList.push(obstical)
    shadowGenerator.getShadowMap().renderList.push(box)
    blocks.push(box)  
    lastWasLow = box.position.y === -HEIGHT
}
 
makeBlock(true)
makeBlock(true)
makeBlock(true)
makeBlock(true)
makeBlock(true)
makeBlock()
makeBlock()
makeBlock()
makeBlock()

camera.setTarget(new Vector3(6, 0, 0))


document.body.addEventListener("keydown", e => {
    if(e.keyCode == 32 && player.position.y > SPEHER_SIZE/2 - .05 && player.position.y < SPEHER_SIZE/2 + .05){
        console.log("jump")
        player.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), player.position)
    }
    
    if(e.keyCode == 37 || e.keyCode === 65){
        console.log("left")
        player.physicsImpostor.applyImpulse(new Vector3(0, 0, 3), player.position)
    }
    
    if(e.keyCode == 39 || e.keyCode === 68){
        console.log("right")
        player.physicsImpostor.applyImpulse(new Vector3(0, 0, -3), player.position)
    }
 
    if(e.keyCode == 87){
        console.log("up")
        //player.physicsImpostor.applyImpulse(new Vector3(3, 0, 0), player.position)
    }

})
let speed = .1
engine.runRenderLoop(() => { 
    scene.render()
    let removed = []

    for (let block of blocks) {
        block.position.x -= speed

        if(player.intersectsMesh(block.getChildren()[0], true, false)){
            console.error("game over")
            speed = 0
        }
        
        if (block.position.x <= -DEPTH) {
            removed.push(block) 
        }  
    } 

    for (let block of removed) {   
        blocks = blocks.filter(b => b !== block)
        shadowGenerator.removeShadowCaster(block)
        block.dispose()

        makeBlock() 
    }
})
