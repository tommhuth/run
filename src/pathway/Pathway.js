import Full from "./blocks/Full"
import Gap from "./blocks/Gap"
import Island from "./blocks/Island"
import Ruins from "./blocks/Ruins"
import Bridge from "./blocks/Bridge"
import { random } from "../utils/utils"
import Intro from "./blocks/Intro"
import Marsh from "./blocks/Marsh" 

export const Config = {
    WIDTH: 4.5,
    HEIGHT: 6,
    DEPTH: 4,
    FLOOR_DEPTH: 4.5
}

export default class Pathway {
    path = [] 
    player 
    scene 
    shadowGenerator

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
    constructor(scene, player, shadowGenerator) {
        this.scene = scene
        this.player = player 
        this.shadowGenerator = shadowGenerator  

        this.init()
    } 
    clear() {
        for (let block of this.path) {
            block.remove()
        }

        this.path.length = 0
    }
    init(){
        let scene = this.scene
        let maxJumpDistance = this.maxJumpDistance

        this.add(new Intro(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition, { doObstacle: false }))    
        this.add(new Full(scene, this.zPosition, { doObstacle: false }))       
        //this.add(new Marsh(scene, this.zPosition, { doObstacle: true }))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: false }))  
        this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: true }))  
        this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: true }))    
        /*this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: true }))  
        
        this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: true }))   
        this.add(new Ruins(scene, this.zPosition, { collapsable: false, doTree: true }))  
        this.add(new Full(scene, this.zPosition))       
        this.add(new Island(scene, this.zPosition, { maxJumpDistance, lastWasSame: false }))  
        this.add(new Full(scene, this.zPosition)) 
        */
    } 
    remove(block) { 
        block.remove()
        this.shadowGenerator.removeShadowCaster(block.group, true)
 
        this.path = this.path.filter(i => i !== block)
    } 
    add(block) {
        this.path.push(block)
    }
    addRandom() {
        let block = this.getRandomBlock()

        console.log("Added: " + block.constructor.name)

        this.add(block)
    }
    getRandomBlock(){
        let previous = this.path[this.path.length - 1]
        let types = [Gap, Full, Island, Ruins, Bridge, Marsh]
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
            case Ruins:
                return new Ruins(scene, zPosition)
            case Bridge:
                return new Bridge(scene, zPosition, { lastWasSame: previous instanceof Bridge, previousBridgeX: previous.bridgeX })
            default: 
                throw new Error("Unknown path type " + type.name)
        }
    }
    beforeRender() {
        let removed = []

        for (let block of this.path) {
            if (block.position.z < this.player.position.z + 22 && !block.hasShadows) {
                this.shadowGenerator.addShadowCaster(block.group)
                block.hasShadows = true 
            }

            if (this.player.position.z > block.position.z + block.depth + 10 ) {
                removed.push(block)
            } else {
                block.beforeRender(this.player)
            }
        }

        for (let block of removed) {
            this.remove(block)
            this.addRandom()
        }
    }
}
