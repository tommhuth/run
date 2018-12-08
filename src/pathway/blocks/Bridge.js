import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getFlipRotation } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../deco/makeRocks" 
import makePlant from "../../deco/makePlant" 
import Full from "./Full"

export default class Bridge extends PathwayBlock {
    requiredNext = [Full, Bridge] 
    bridgeX
    hasTriggeredCollapse 
    collapseTriggerDistanceRandomizer = Math.random() * 5 + 12
    bridgeParts = []

    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    get collapseTriggerDistance() {
        return this.position.z - this.collapseTriggerDistanceRandomizer
    }

    constructor(scene, zPosition, {
        lastWasSame,
        previousBridgeX,
        collapsable = Math.random() > .5,
        width = 1,
        height = .65,
        depth = Math.ceil(Math.random() * (Config.DEPTH + 2)) + 4, 
    } = {}) {
        super(scene, width, height, depth) 
        let bridgeX = lastWasSame ? previousBridgeX : (Math.random() * width / 2 - 1) * flip() 
        let pillarStart = clone("bridgeEnd")
        let pillarEnd = clone("bridgeEnd")  
        let plant = makePlant(scene)
        let rocks = makeRocks(scene, { centerOffset: 1, count: 10, depth })
        let plantScale = Math.random() * .35 + .4
        
        rocks.position.y = -Config.HEIGHT
        rocks.parent = this.group

        plant.position.y = -Config.HEIGHT
        plant.position.x = bridgeX + flip() * (Math.random() * 3 + 2)
        plant.position.z = (Math.random() * (depth/2 - 2)) * flip()
        plant.scaling.set(plantScale, plantScale, plantScale)
        plant.parent = this.group
        
        pillarStart.scaling.z = .5
        pillarStart.position.set(bridgeX, -.75, -.5)
        pillarStart.rotate(Axis.Y, Math.PI/2)
        pillarStart.parent = this.group
    
        pillarEnd.scaling.z = .5
        pillarEnd.position.set(bridgeX, -.75, depth - .5)
        pillarEnd.rotate(Axis.Y, -Math.PI / 2)
        pillarEnd.parent = this.group
     
        this.position.set(0, 0, zPosition)
        this.bridgeX = bridgeX
        this.hasTriggeredCollapse = !collapsable
    
        for (let i = 0; i < depth + 1; i++) {
            const block = clone(randomList("bridgeMid", "bridgeMid2", "bridgeMid3"))
    
            resize(block, width, height, width)
    
            block.rotate(Axis.Y, getFlipRotation())
            block.rotate(Axis.Z, getFlipRotation())
            block.rotate(Axis.X, getFlipRotation())
            block.position.set(bridgeX, -height/2 - .05, i * (width + 0)) 
            block.physicsImpostor = new Impostor(block, Impostor.BoxImpostor, { mass: 0 }, scene)
            block.parent = this.group
    
            this.bridgeParts.push(block)
        }

        this.makeFloor(width, depth, new Vector3(bridgeX, 0, depth/2))
    }
    beforeRender(player){ 
        super.beforeRender(player)
        
        if (player.position.z < this.collapseTriggerDistance || this.hasTriggeredCollapse) {
            return 
        }   

        for (let i = 2; i < this.bridgeParts.length - 3 && i - 3 < 2; i++) {
            let bridgeBlock = this.bridgeParts[i]  

            bridgeBlock.physicsImpostor.setMass(10)  
        }
 
        this.hasTriggeredCollapse = true
    }
}
