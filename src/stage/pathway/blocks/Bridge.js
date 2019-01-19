import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getFlipRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../../builders/makeRocks"  
import Full from "./Full"

export default class Bridge extends PathwayBlock {
    requiredNext = [Full] 
    bridgeX 
    bridgeParts = []

    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    get collapseTriggerDistance() {
        return this.position.z - this.collapseTriggerDistanceRandomizer
    }

    constructor(scene, zPosition, { 
        width = random.real(.65, .85), 
        depth = random.integer(6, Config.DEPTH * 2), 
        doCoins = random.bool()
    } = {}) {
        super(scene, width, .25, depth) 
        let height = .25
        let bridgeX = random.real(-.5, .5) 
        let rocks = makeRocks(scene, { centerOffset: 1, count: 7, depth })  
        
        rocks.position.y = -Config.HEIGHT
        rocks.parent = this.group 
          
        this.position.set(0, 0, zPosition) 
    
        for (let i = 0; i < depth + 1; i++) {
            const block = clone(random.pick(["bridgeMid", "bridgeMid2", "bridgeMid3"]))
    
            resize(block, width, height, 1.15)
    
            block.rotate(Axis.Y, getFlipRotation())
            block.rotate(Axis.Z, getFlipRotation())
            block.rotate(Axis.X, getFlipRotation())
            block.position.set(bridgeX, height / 2 , i * 1) 
            block.physicsImpostor = new Impostor(block, Impostor.BoxImpostor, { mass: 0 }, scene)
            block.parent = this.group
    
            this.bridgeParts.push(block)
        }

        if (doCoins) { 
            this.addCoinLine(
                3, 
                new Vector3(bridgeX, 0, 2),
                new Vector3(bridgeX, 0, 5),
                new Vector3(bridgeX, .5, depth/2 - 2)
            )
        }

        this.group.rotate(Axis.Y, random.real(-.1, .1))
    } 
}
