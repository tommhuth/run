import Full from "./blocks/Full"
import Gap from "./blocks/Gap"
import Island from "./blocks/Island"
import Ruins from "./blocks/Ruins"
import Bridge from "./blocks/Bridge"
import { random } from "../../utils/helpers"
import Intro from "./blocks/Intro"
import Tower from "./blocks/Tower"
import Marsh from "./blocks/Marsh" 
import WaterPlants from "./blocks/WaterPlants"  

export const Config = {
    WIDTH: 4.5,
    HEIGHT: 6,
    DEPTH: 4,
    FLOOR_DEPTH: 4.5,
    FORWARD_BUFFER: 40
}

export default class Pathway {
    path = [] 
    player 
    scene  

    get zPosition() {
        let previousBlock = this.path[this.path.length - 1]
 
        if (previousBlock) {
            return previousBlock.position.z + previousBlock.depth 
        }

        return 0
    }
    get maxJumpDistance() { 
        return this.player.speed * .875
    }
    constructor(scene, player) {
        this.scene = scene
        this.player = player  

        this.init()
    } 
    restart() { 
        this.clear()
        this.init()
    }
    init(){
        let scene = this.scene
        let maxJumpDistance = this.maxJumpDistance
    
        this.add(new Intro(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))         
        this.add(new Full(scene, this.zPosition))          
        this.add(new Full(scene, this.zPosition))      
        this.add(new Tower(scene, this.zPosition, { maxJumpDistance }))        
    } 
    add(block = this.getRandomBlock()) { 
        this.path.push(block)
    } 
    remove(block) { 
        block.remove()
 
        this.path = this.path.filter(i => i !== block)
    } 
    clear() {
        for (let block of this.path) {
            block.remove()
        }

        this.path.length = 0
    }
    getRandomBlock(){
        let previous = this.path[this.path.length - 1]
        let types = [Gap, Full, Island, Ruins, Bridge, Marsh, WaterPlants, Tower]
        let zPosition = this.zPosition
        let maxJumpDistance =  this.maxJumpDistance
        let scene = this.scene
        let type 

        if (previous.requiredNext.length) {
            type = random.pick(previous.requiredNext)
        } else {
            type = random.pick(types)
 
            while (!previous.canAcceptNext(type, this.path) || !type.isAcceptableNext(type, this.path)) { 
                type = random.pick(types)
            }
        } 

        switch (type) {
            case Gap:
                return new Gap(scene, zPosition, { maxJumpDistance }) 
            case Marsh:
                return new Marsh(scene, zPosition, { maxJumpDistance }) 
            case Full:
                return new Full(scene, zPosition)
            case Island:
                return new Island(scene, zPosition, { maxJumpDistance, lastWasSame: previous instanceof Island })
            case WaterPlants:
                return new WaterPlants(scene, zPosition, { maxJumpDistance })
            case Ruins:
                return new Ruins(scene, zPosition)
            case Bridge:
                return new Bridge(scene, zPosition) 
            case Tower:
                return new Tower(scene, zPosition)
            default: 
                throw new Error("Unknown path type " + type.name)
        }
    }   
}
