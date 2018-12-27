import { Scene, Engine, CannonJSPlugin } from "babylonjs"
import { Vector3, Color3, Color4 } from "babylonjs"
import { DirectionalLight, HemisphericLight, ShadowGenerator } from "babylonjs"
 
export default function() {
    const physicsPlugin = new CannonJSPlugin(false, 16) 
    const canvas = document.getElementById("app")
    const engine = new Engine(canvas, true, undefined, true)
    const scene = new Scene(engine)
    const light = new DirectionalLight("directionalLight", new Vector3(-2, -2, 2), scene)  
    const hemisphere = new HemisphericLight("hemisphereLight", new Vector3(0, 0, 0), scene) 
    const shadowGenerator = new ShadowGenerator(1800, light, true)
    
    engine.renderEvenInBackground = false
    engine.setHardwareScalingLevel(.75)
    
    scene.autoClear = false 
    scene.autoClearDepthAndStencil = false
    scene.blockMaterialDirtyMechanism = true
    scene.enablePhysics(new Vector3(0, -9.8, 0), physicsPlugin)
    
    scene.getPhysicsEngine().setTimeStep(1 / 45)
    scene.fogMode = Scene.FOGMODE_EXP2
    scene.fogDensity = .05100
    scene.fogColor = new Color3(12/255, 17/255, 17/255)
    scene.fogEnd = 30
    scene.fogStart = 16
    scene.clearColor = Color3.Black()
    
    light.diffuse = Color3.White()
    light.intensity = .5
    light.autoUpdateExtends = false
    light.shadowMaxZ = 15
    light.shadowMinZ = -20
    light.shadowFrustumSize = 30 
    hemisphere.intensity = 0
    shadowGenerator.usePoissonSampling = true 
    //shadowGenerator.bias = 0.006 
    shadowGenerator.setDarkness(.5)
    shadowGenerator.frustumEdgeFalloff = 1
    shadowGenerator.forceBackFacesOnly = true 

    return { 
        scene, 
        engine, 
        light, 
        hemisphere, 
        shadowGenerator,
        beforeRender(player){
            light.position.z = player.position.z + 5
        } 
    }
}
 
