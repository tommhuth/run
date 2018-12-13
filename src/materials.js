import { StandardMaterial, Color3, CubeTexture, Texture } from "babylonjs"

export default {
    init(scene) {
        let rock = new StandardMaterial(null, scene)
        let powerup = new StandardMaterial(null, scene) 
        let greenery = new StandardMaterial(null, scene) 
    
        rock.diffuseColor = Color3.White()
        
        //rock.ambientColor = new Color3(.1,.1,.1)
        rock.reflectionTexture = new CubeTexture("https://www.babylonjs-playground.com/textures/skybox", scene)
        rock.bumpTexture = new Texture("https://www.babylonjs-playground.com/textures/rockn.png", scene);
       // rock.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        rock.roughness = 7
        rock.diffuseColor = new Color3(1, 1, 1);  

        powerup.diffuseColor = Color3.Yellow()
        greenery.diffuseColor = Color3.Green()
    
        this.rock = rock 
        this.powerup = powerup
        this.greenery = greenery
    }
} 
