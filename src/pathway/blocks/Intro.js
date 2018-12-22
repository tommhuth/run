import PathwayBlock from "../PathwayBlock" 
import { clone } from "../../utils/modelLoader" 
import makeWaterPlant from "../../deco/makeWaterPlant"
import makePlant from "../../deco/makePlant"
import { Axis, Vector3 } from "babylonjs"
import { Config } from "../Pathway"
import { random, getRandomRotation } from "../../utils/utils"

export default class Intro extends PathwayBlock {   
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition) {  
        super(scene, 0, 0, 10) 

        let logo = clone("logo")  
        let plants = [
            new Vector3(-5.5, -Config.FLOOR_DEPTH, 1),
            new Vector3(5, -Config.FLOOR_DEPTH, 3),
            new Vector3(-6, -Config.FLOOR_DEPTH, 8),
            new Vector3(7, -Config.FLOOR_DEPTH, 7),
            new Vector3(4.5, -Config.FLOOR_DEPTH, 12)
        ]
        let bushes = [ 
            {
                position: new Vector3(2, -3.5, 4.5),
                rotation: -.1,
                rotationAxis: Axis.Z
            },
            {
                position: new Vector3(-2.5, -6, 2),
                rotation: .1,
                rotationAxis: Axis.Z
            } 
        ]
        let rocks = [
            {
                position: new Vector3(-2, -6, 8),
                scale: 3
            },
            {
                position: new Vector3(3, -6, 6),
                scale: 3
            },
            {
                position: new Vector3(-1, -6, -5),
                scale: 1
            },
            {
                position: new Vector3(2, -6, -4),
                scale: 1
            },
            {
                position: new Vector3(1, -6, -2),
                scale: 1
            }
        ]

        for (let { scale, position } of rocks) { 
            let rock = clone(random.pick(["rock", "rock2"]))
            
            rock.scaling.set(scale, scale * .75, scale)
            rock.rotate(Axis.Y, getRandomRotation())
            rock.rotate(Axis.Z, getRandomRotation())
            rock.rotate(Axis.X, getRandomRotation())
            rock.position = position
            rock.parent = this.group
        }

        for (let position of plants) { 
            let plant = makeWaterPlant(random.integer(1, 3))
            
            plant.position = position
            plant.parent = this.group
        }

        for (let { position, rotation, rotationAxis } of bushes) { 
            let bush = makePlant(scene) 
            
            bush.position = position
            bush.rotate(rotationAxis, rotation)
            bush.parent = this.group
        }
        
        logo.scaling.set(1.35, 1.35, 1.35)
        logo.rotate(Axis.Y, -Math.PI)
        logo.rotate(Axis.Z, .3) 
        logo.position.y = -7.5
        logo.position.z = 4
        logo.position.x = 0
        logo.parent = this.group
 
 
        this.position.z = zPosition 
    }  
}
