import { StandardMaterial, Color3 } from "babylonjs"

export default {
    init(scene) {
        let rock = new StandardMaterial(null, scene)
        let powerup = new StandardMaterial(null, scene) 
        let greenery = new StandardMaterial(null, scene) 
    
        rock.diffuseColor = new Color3(.2, .2, .2)
        rock.specularColor = Color3.White() 
        rock.specularPower = 10

        powerup.diffuseColor = Color3.Yellow()

        greenery.diffuseColor = new Color3(0/255, 255/255, 153/255)
        greenery.specularColor = Color3.Yellow() 
        greenery.specularPower = 10
    
        this.rock = rock 
        this.powerup = powerup
        this.greenery = greenery
    }
} 
