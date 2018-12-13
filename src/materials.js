import { StandardMaterial, Color3 } from "babylonjs"

export default {
    init(scene) {
        let rock = new StandardMaterial(null, scene)
        let powerup = new StandardMaterial(null, scene) 
        let greenery = new StandardMaterial(null, scene) 
    
        rock.diffuseColor = Color3.White()
        powerup.diffuseColor = Color3.Yellow()
        greenery.diffuseColor = Color3.Green()
    
        this.rock = rock 
        this.powerup = powerup
        this.greenery = greenery
    }
} 
