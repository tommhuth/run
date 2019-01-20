import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getRandomRotation, random, flip } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import Full from "./Full"
import makeIsland from "../../../builders/makeIsland" 

export default class WaterPlants extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path) && path.filter(i => i instanceof WaterPlants).length === 0
    } 
    requiredNext = [Full] 
    
    constructor(scene, zPosition, {
        maxJumpDistance,
        width = Config.WIDTH,
        height = Config.HEIGHT, 
        platforms = random.integer(3, 8)
    } = {}) {
        super(scene, width, height) 

        let depth = this.makePlatforms(platforms, maxJumpDistance) + maxJumpDistance
  
        this.depth = this.makeStaircase(depth) 
        this.position.set(0, -Config.FLOOR_DEPTH, zPosition)
    } 
    makePlatforms(platformCount, maxJumpDistance) {
        let depth = 0

        for (let i = 0; i < platformCount; i++) {
            let plant = clone("plant")
            let diameter = i === 0 ? 4 : random.real(2.5, 3.5) 
            let gap = random.real(maxJumpDistance - 1.5, maxJumpDistance - .5)
            let height = 6 + random.real(-1, 1)  
            let hasSibling = random.bool(60)

            resize(plant, diameter, height, diameter)
 
            plant.position.x = random.real(-1.75, 1.75) 
            plant.position.z = diameter/2 + depth + gap
            plant.rotate(Axis.Y, getRandomRotation())
            plant.physicsImpostor = new Impostor(plant, Impostor.CylinderImpostor, { mass: 0 }, this.scene)
            plant.parent = this.group

            if (hasSibling) {
                let siblingPlant = clone("plant")
                let siblingDiameter = random.real(.5, 2)   
                let xOffset = (diameter/2 + siblingDiameter/2)
    
                resize(siblingPlant, siblingDiameter, height - 4, siblingDiameter)

                siblingPlant.position = plant.position.clone()
                siblingPlant.position.x += random.real(xOffset, xOffset + 6) * flip()  
                siblingPlant.position.z += (diameter/2 + siblingDiameter/2) 
                siblingPlant.rotate(Axis.Y, getRandomRotation())
                siblingPlant.physicsImpostor = new Impostor(siblingPlant, Impostor.CylinderImpostor, { mass: 0 }, this.scene)
                siblingPlant.parent = this.group

                this.makeFloor(siblingDiameter, siblingDiameter, new Vector3(siblingPlant.position.x, .25, siblingPlant.position.z)) 
            } 
            
            if (random.bool()) {  
                this.addCoin(new Vector3(plant.position.x, plant.position.y + .5, plant.position.z))
            }
 
            this.makeFloor(diameter, diameter, new Vector3(plant.position.x, .5, plant.position.z)) 

            depth += diameter + gap
        }

        return depth
    }
    makeStaircase(depth) {
        for (let i = 0; i < 4; i++) {
            let diameter = random.real(3.5, 4)  
            let actualDiamter = diameter + random.real(.75, 1.25)  
            let height = 6
            let { island, islandGroup } = makeIsland({ diameter: actualDiamter, height })

            island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, this.scene)

            islandGroup.position.x = random.real(-1.5, 1.5)
            islandGroup.position.z = depth + diameter / 2
            islandGroup.position.y = -height / 2 + .15 + i * 1.2
            islandGroup.parent = this.group 

            this.makeFloor(
                actualDiamter, 
                actualDiamter, 
                new Vector3(islandGroup.position.x, islandGroup.position.y + height / 2 + .2, islandGroup.position.z)
            ) 

            depth += diameter
        }

        return depth
    }
}
