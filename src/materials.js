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
    
        rock.diffuseColor = new Color3(191/255, 215/255, 234/255 )
        rock.specularColor = new Color3(.3, .3, .3)
        rock.specularPower = 0
        rock.ambientColor = new Color3(.8, .8, .8)

        powerup.diffuseColor = Color3.Yellow() 

        greenery.diffuseColor = new Color3(0/255, 255/255, 153/255)
        greenery.specularColor = Color3.Yellow() 
        greenery.emissiveColor = new Color3(0/255, 112/255, 67/255)
        greenery.specularPower = 10

        water.diffuseColor = new Color3(35/255, 152/255, 178/255)
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
