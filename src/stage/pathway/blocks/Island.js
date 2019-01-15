import { Axis, Vector3 } from "babylonjs" 
import { flip, getRandomRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock"  
import { Config } from "../Pathway"
import Gap from "./Gap"
import makeWaterPlant from "../../../builders/makeWaterPlant"
import makeIsland from "../../../builders/makeIsland" 
import Bridge from "./Bridge"

export default class Island extends PathwayBlock {
    illegalNext = [Gap, Bridge]  
    gap1
    gap2 
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        lastWasSame = false,
        radius = random.real(2.25, Config.WIDTH),
        height = Config.HEIGHT, 
        gapSize = random.real(2.5, maxJumpDistance - 1),
        leftPlant = random.bool(),
        rightPlant = random.bool(),
        plantX = flip(), 
    } = {}) {  
        let gap1 = lastWasSame ? 0 : gapSize
        let gap2 = gapSize  
        let depth = radius + gap1 + gap2   
        let { islandGroup } = makeIsland({ scene, radius, height }) 
 
        super(scene, radius, height, depth)
         
        islandGroup.parent = this.group
        islandGroup.position.set(
            random.real(-1.5, 1.5),
            -height / 2, 
            gap1 + radius / 2
        )  
        
        this.gap1 = gap1
        this.gap2 = gap2   
        this.position.set(0, 0, zPosition) 

        this.makeFloor(
            radius - .25, 
            radius - .5, 
            new Vector3(islandGroup.position.x, 0, gap1 + radius / 2)
        ) 

        if (leftPlant) {
            let plants = makeWaterPlant(random.integer(1, 3)) 

            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                islandGroup.position.x + (radius + random.real(.5, 2)) * plantX, 
                -Config.FLOOR_DEPTH, 
                0
            )    
        }
         
        if (rightPlant) { 
            let plants = makeWaterPlant(random.integer(1, 3))
    
            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                islandGroup.position.x + (radius + random.real(.5, 2)) * -plantX, 
                -Config.FLOOR_DEPTH,
                0
            )
        }
    }
}
