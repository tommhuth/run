import { Axis, Vector3 } from "babylonjs" 
import { flip, getRandomRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock"  
import { Config } from "../Pathway"
import Gap from "./Gap"
import makeWaterPlant from "../../../builders/makeWaterPlant"
import makeIsland from "../../../builders/makeIsland" 
import Bridge from "./Bridge"
import Tower from "./Tower"

export default class Island extends PathwayBlock {
    illegalNext = [Gap, Bridge, Tower]  
    gap1
    gap2 
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        lastWasSame = false,
        diameter = random.real(2.25, Config.WIDTH),
        height = Config.HEIGHT, 
        gapSize = random.real(2.5, maxJumpDistance - 1),
        leftPlant = random.bool(),
        rightPlant = random.bool(),
        plantX = flip(), 
    } = {}) {  
        let gap1 = lastWasSame ? 0 : gapSize
        let gap2 = gapSize  
        let depth = diameter + gap1 + gap2   
        let { islandGroup } = makeIsland({ scene, diameter, height }) 
 
        super(scene, diameter, height, depth)
         
        islandGroup.parent = this.group
        islandGroup.position.set(
            random.real(-1.5, 1.5),
            -height / 2, 
            gap1 + diameter / 2
        )  
        
        this.gap1 = gap1
        this.gap2 = gap2   
        this.position.set(0, 0, zPosition) 

        this.makeFloor(
            diameter - .25, 
            diameter - .5, 
            new Vector3(islandGroup.position.x, 0, gap1 + diameter / 2)
        ) 

        if (leftPlant) {
            let plants = makeWaterPlant(random.integer(1, 3)) 

            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                islandGroup.position.x + (diameter + random.real(.5, 2)) * plantX, 
                -Config.FLOOR_DEPTH, 
                0
            )    
        }
         
        if (rightPlant) { 
            let plants = makeWaterPlant(random.integer(1, 3))
    
            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                islandGroup.position.x + (diameter + random.real(.5, 2)) * -plantX, 
                -Config.FLOOR_DEPTH,
                0
            )
        }
    }
}
