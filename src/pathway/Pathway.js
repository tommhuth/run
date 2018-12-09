import Full from "./blocks/Full"
import Gap from "./blocks/Gap"
import Island from "./blocks/Island"
import Ruins from "./blocks/Ruins"
import Bridge from "./blocks/Bridge"

export const Config = {
    WIDTH: 4.5,
    HEIGHT: 6,
    DEPTH: 4
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
    clear() {
        for (let block of this.path) {
            block.remove()
        }

        this.path.length = 0
    }
    init(){
        let scene = this.scene
        let maxJumpDistance = this.maxJumpDistance

        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))       
        this.add(new Full(scene, this.zPosition))   
        this.add(new Ruins(scene, this.zPosition, { lastWasSame: false  })) 
        this.add(new Full(scene, this.zPosition))      
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))  
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: true, previousBridgeX: this.path[6].bridgeX  })) 
     /*   this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    
        this.add(new Full(scene, this.zPosition))    

        this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance, lastWasSame: false }))  
          
        this.add(new Full(scene, this.zPosition))       
        this.add(new Full(scene, this.zPosition))       
        this.add(new Full(scene, this.zPosition))       
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))       
        this.add(new Bridge(scene, this.zPosition, { lastWasSame: false  }))   
        this.add(new Full(scene, this.zPosition))        */
       /*    this.add(new Gap(scene, this.zPosition, { maxJumpDistance }))      
        this.add(new Full(scene, this.zPosition))      
     
         this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: false }))  
         this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: true }))  
         this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: true }))  
        this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: true }))  
        this.add(new Full(scene, this.zPosition))   
        this.add(new Full(scene, this.zPosition))   
        this.add(new Island(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: false })) 
        this.add(new Island(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance, lastWasSame: true }))
        this.add(new Full(scene, this.zPosition))   
        this.add(new HighIsland(scene, this.zPosition, { maxJumpDistance: this.maxJumpDistance }))  */

    } 
    remove(block) { 
        block.remove()
 
        this.path = this.path.filter(i => i !== block)
    } 
    add(block) {
        this.path.push(block)
    }
    addRandom() {
        let block = this.getRandomBlock()

        this.add(block)
    }
    getRandomBlock(){
        let previous = this.path[this.path.length - 1]
        let types = [Gap, Full, Island, Ruins, Bridge]
        let zPosition = this.zPosition
        let maxJumpDistance =  this.maxJumpDistance
        let scene = this.scene
        let type 

        if (previous.requiredNext.length) {
            type = previous.requiredNext[Math.floor(Math.random() * previous.requiredNext.length)] 
        } else {
            type = types[Math.floor(Math.random() * types.length)] 
 
            while (!previous.canAcceptNext(type, this.path) || !type.isAcceptableNext(type, this.path)) { 
                type = types[Math.floor(Math.random() * types.length)]
            }
        } 

        switch (type) {
            case Gap:
                return new Gap(scene, zPosition, { maxJumpDistance }) 
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
            if (this.player.position.z >= block.position.z + block.depth + 12 ) {
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
