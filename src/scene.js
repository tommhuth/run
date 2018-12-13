import { Scene, Engine, CannonJSPlugin } from "babylonjs"
import { Vector3, Color3 } from "babylonjs"
import { DirectionalLight, HemisphericLight, ShadowGenerator } from "babylonjs"

const state = {
    fogEnd: 26,
    fogStart: 12
}

export default function() {
    const physicsPlugin = new CannonJSPlugin(false, 10) 
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
    scene.fogMode = Scene.FOGMODE_LINEAR
    scene.fogColor = Color3.White()
    scene.fogStart = 6
    scene.fogEnd = state.fogEnd
    scene.fogStart = state.fogStart
    scene.clearColor = Color3.White()
    
    light.diffuse = Color3.White()
    light.intensity = .5
    light.autoUpdateExtends = false
    light.shadowMaxZ = 10
    light.shadowMinZ = -15
    
    hemisphere.diffuse = new Color3(209/255, 242/255, 1) 
    hemisphere.groundColor =  new Color3(209/255, 242/255, 1) 
    hemisphere.intensity = .5 

    shadowGenerator.usePoissonSampling = true 
    shadowGenerator.bias = 0.00051
    shadowGenerator.setDarkness(.7)
    shadowGenerator.frustumEdgeFalloff = 1

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
 
