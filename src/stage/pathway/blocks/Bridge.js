import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getFlipRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../../builders/makeRocks"  
import Full from "./Full"

export default class Bridge extends PathwayBlock {
    requiredNext = [Full, Bridge] 
    bridgeX
    hasTriggeredCollapse 
    collapseTriggerDistanceRandomizer = random.real(5, 17)
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
        collapsable = random.bool(),
        width = 1,
        height = .65,
        depth = random.integer(4, Config.DEPTH + 2), 
    } = {}) {
        super(scene, width, height, depth) 
        let bridgeX = lastWasSame ? previousBridgeX : random.real(-width / 2 + 1, width / 2 - 1)
        let pillarStart = clone("bridgeEnd")
        let pillarEnd = clone("bridgeEnd")  
        //let plant = makePlant(scene)
        let rocks = makeRocks(scene, { centerOffset: 1, count: 7, depth })
       // let plantScale = random.real(.4, .75)  
        
        rocks.position.y = -Config.HEIGHT
        rocks.parent = this.group
/*
        plant.position.y = -Config.HEIGHT
        plant.position.x = bridgeX + random.real(2, 5) * flip()
        plant.position.z = random.real(1, depth - 2)
        plant.scaling.set(plantScale, plantScale, plantScale)
        plant.parent = this.group*/
        
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
            const block = clone(random.pick(["bridgeMid", "bridgeMid2", "bridgeMid3"]))
    
            resize(block, width, height, width)
    
            block.rotate(Axis.Y, getFlipRotation())
            block.rotate(Axis.Z, getFlipRotation())
            block.rotate(Axis.X, getFlipRotation())
            block.position.set(bridgeX, -height / 2 - .005, i * width) 
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
