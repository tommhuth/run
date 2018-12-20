import { Scene, Engine, CannonJSPlugin } from "babylonjs"
import { Vector3, Color3, Color4 } from "babylonjs"
import { DirectionalLight, HemisphericLight, ShadowGenerator } from "babylonjs"

const state = {
    fogEnd: 25,
    fogStart: 6
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
    scene.fogColor = new Color3(21/255, 21/255, 40/255)
    scene.fogEnd = state.fogEnd
    scene.fogStart = state.fogStart
    scene.clearColor = Color3.Black()
    
    light.diffuse = Color3.White()
    light.intensity = .5
    light.autoUpdateExtends = false
    light.shadowMaxZ = 15
    light.shadowMinZ = -15
    
    hemisphere.diffuse = new Color3(66/255, 134/255, 255/255) 
    hemisphere.groundColor =  new Color3(2/255, 255/255, 154/255) 
    hemisphere.intensity = .5 

    shadowGenerator.usePoissonSampling = true 
    //shadowGenerator.bias = 0.006 
    shadowGenerator.setDarkness(.25)
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
 
