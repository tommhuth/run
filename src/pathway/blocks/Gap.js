import PathwayBlock from "../PathwayBlock"
import Island from "./Island"
import Ruins from "./Ruins"
import Bridge from "./Bridge"
import { random } from "../../utils/utils"

export default class Gap extends PathwayBlock {  
    illegalNext = [Gap, Island, Ruins, Bridge]
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        depth = random.integer(maxJumpDistance - 1, maxJumpDistance) 
    }) {  
        super(scene) 

        this.depth = depth
 
        this.position.z = zPosition 
    }  
}
