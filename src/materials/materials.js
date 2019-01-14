import { StandardMaterial, Color3 } from "babylonjs"

export default {
    rock: null,
    powerup: null,
    greenery: null,
    water: null,
    player: null,

    init(scene) {
        let rock = new StandardMaterial(null, scene)
        let powerup = new StandardMaterial(null, scene) 
        let greenery = new StandardMaterial(null, scene) 
        let water = new StandardMaterial(this.scene)  
        let player =  new StandardMaterial(this.scene)  
    
        rock.diffuseColor = Color3.Magenta() //new Color3(42/255, 45/255, 52/255 )
        rock.specularColor = new Color3(0, 0, 0)
        rock.specularPower = 0
        rock.ambientColor = new Color3(42/255, 45/255, 52/255 )

        powerup.diffuseColor = Color3.Yellow() 

        greenery.diffuseColor = new Color3(128/255, 194/255, 175/255)
        greenery.specularColor = Color3.Yellow() 
        //greenery.emissiveColor = new Color3(128/255, 194/255, 175/255)
        greenery.specularPower = 0

        water.diffuseColor = new Color3(8/255, 76/255, 97/255)
        //water.specularColor = new Color3(.5, 1, 1)
        //water.specularPower = 0
 
        player.emissiveColor = Color3.White()
    
        this.rock = rock 
        this.powerup = powerup
        this.greenery = greenery
        this.water = water
        this.player = player
    }
} 
