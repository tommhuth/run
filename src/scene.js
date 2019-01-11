import { Scene, Engine, CannonJSPlugin } from "babylonjs"
import { Vector3, Color3 } from "babylonjs"
import { DirectionalLight, HemisphericLight, ShadowGenerator } from "babylonjs"
import materials from "./materials"
 
export default function() {
    let physicsPlugin = new CannonJSPlugin(false, 10) 
    let canvas = document.getElementById("app")
    let engine = new Engine(canvas, true, undefined, true)
    let scene = new Scene(engine)
    let light = new DirectionalLight("directionalLight", new Vector3(-2, -3, 2), scene)  
    let hemisphere = new HemisphericLight("hemisphereLight", new Vector3(0, 0, 0), scene) 
    let shadowGenerator = new ShadowGenerator(1800, light, true)
    let resizeTimeout = null
    
    engine.renderEvenInBackground = false
    engine.setHardwareScalingLevel(.75)
    
    scene.autoClear = false 
    scene.autoClearDepthAndStencil = false
    scene.blockMaterialDirtyMechanism = true
    scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
    
    scene.getPhysicsEngine().setTimeStep(1 / 45)
    scene.ambientColor = new Color3(.5, .5, .5)
    scene.fogMode = Scene.FOGMODE_LINEAR 
    scene.fogColor = new Color3(12/255, 17/255, 17/255)
    scene.fogEnd = 40
    scene.fogStart = 10    
    scene.clearColor = Color3.Black()
    
    light.diffuse = Color3.White()
    light.intensity = 1.25
    light.autoUpdateExtends = false
    light.shadowMaxZ = 15
    light.shadowMinZ = -20
    light.shadowFrustumSize = 30 
    
    hemisphere.intensity = 0

    shadowGenerator.usePoissonSampling = true
    shadowGenerator.setDarkness(.5)
    shadowGenerator.frustumEdgeFalloff = 1
    shadowGenerator.forceBackFacesOnly = true 

    // scene is ready so init materials
    materials.init(scene)

    // make sure the scene gets recalced for resizes, with delay    
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => { 
            engine.resize()
            scene.render()  
        }, 250)
    })

    return { 
        scene, 
        engine, 
        light, 
        hemisphere, 
        shadowGenerator,
        runRenderLoop(callback) {
            engine.runRenderLoop(() => {
                callback(light, hemisphere)
                scene.render()
            })
        }
    }
}
 
