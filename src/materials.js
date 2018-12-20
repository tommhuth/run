import { StandardMaterial, Color3 } from "babylonjs"

export default {
    init(scene) {
        let rock = new StandardMaterial(null, scene)
        let powerup = new StandardMaterial(null, scene) 
        let greenery = new StandardMaterial(null, scene) 
    
        rock.diffuseColor = new Color3(.4, .4, .4)
        rock.specularColor = new Color3(.3, .3, .3)
        rock.specularPower = 10

        powerup.diffuseColor = Color3.White()
        powerup.emissiveColor = Color3.White() //new Color3(255/255, 0/255, 191/255)
        //powerup.specularColor = Color3.Yellow() // new Color3(255/255, 0/255, 191/255)

        greenery.diffuseColor = new Color3(0/255, 255/255, 153/255)
        greenery.specularColor = Color3.Yellow() 
        greenery.specularPower = 10
    
        this.rock = rock 
        this.powerup = powerup
        this.greenery = greenery
    }
} 
