import PathwayBlock from "../PathwayBlock"
import Island from "./Island"
import Ruins from "./Ruins"
import Bridge from "./Bridge"
import Marsh from "./Marsh"
import WaterPlants from "./WaterPlants"
import Tower from "./Tower"

export default class Gap extends PathwayBlock {  
    illegalNext = [Gap, Island, Ruins, Bridge, Marsh, WaterPlants, Tower]
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { maxJumpDistance, depth = maxJumpDistance }) {  
        super(scene, 0, 0, depth) 
 
        this.position.z = zPosition 
    }  
}
