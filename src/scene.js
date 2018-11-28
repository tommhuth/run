import { Scene, Engine, CannonJSPlugin } from "babylonjs"
import { Vector3, Color3 } from "babylonjs"
import { DirectionalLight, HemisphericLight } from "babylonjs"

const state = {
    fogEnd: 55,
    fogStart: 19
}

const physicsPlugin = new CannonJSPlugin(false, 8) 
const canvas = document.getElementById("app")
const engine = new Engine(canvas, true, undefined, true)
const scene = new Scene(engine)
const light = new DirectionalLight("directionalLight", new Vector3(-2, -2, 2), scene)  
const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(0, 0, 0), scene) 

engine.renderEvenInBackground = false
engine.setHardwareScalingLevel(.75)

scene.autoClear = false
scene.autoClearDepthAndStencil = false
scene.blockMaterialDirtyMechanism = true
scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)

scene.getPhysicsEngine().setTimeStep(1 / 45)
scene.fogMode = Scene.FOGMODE_LINEAR
scene.fogColor = Color3.White()
scene.fogStart = 6
scene.fogEnd = state.fogEnd
scene.fogStart = state.fogStart
scene.clearColor = Color3.White()

light.diffuse = Color3.White()
light.intensity = .5

hemisphere.diffuse = new Color3(209/255, 242/255, 1) 
hemisphere.groundColor =  new Color3(209/255, 242/255, 1) 
hemisphere.intensity = .5

function setSceneRunning(){
    state.fogEnd = 30
    state.fogStart = 14
}

engine.runRenderLoop(() => {   
    scene.fogEnd += (state.fogEnd - scene.fogEnd) / 30 
    scene.fogStart += (state.fogStart - scene.fogStart) / 30 

    scene.render()  
})

export { scene, setSceneRunning, canvas }
