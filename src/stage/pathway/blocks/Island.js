import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, flip, getRandomRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock"  
import { Config } from "../Pathway"
import Gap from "./Gap"
import makeWaterPlant from "../../../builders/makeWaterPlant"
import makePlant from "../../../builders/makePlant"
import Bridge from "./Bridge"

export default class Island extends PathwayBlock {
    illegalNext = [Gap, Bridge]  
    gap1
    gap2 
    deltaHeight
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        lastWasSame = false,
        islandSize = random.real(2.25, Config.WIDTH),
        height = Config.HEIGHT, 
        gapSize = random.real(2.5, maxJumpDistance - 1),
        leftPlant = random.bool(),
        rightPlant = random.bool(),
        plantX = flip(),
        doGravel = random.bool(60) || islandSize > 3.5,
        doBush = random.bool()
    } = {}) {  
        const gap1 = lastWasSame ? 0 : gapSize
        const gap2 = gapSize  
        const depth = islandSize + gap1 + gap2   
        const island = clone(random.pick(["island", "island2", "island3"])) 
        const deltaHeight = random.real(-.5, .5, true)
 
        super(scene, islandSize, height, depth)
        
        resize(island, islandSize, height + deltaHeight, islandSize) 
        island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, scene)
        island.parent = this.group
        island.rotate(Axis.Y, random.real(-Math.PI * 2, Math.PI * 2))
        island.position.set(
            random.real(-1.5, 1.5),
            -height / 2, 
            gap1 + islandSize / 2
        )  
        
        this.gap1 = gap1
        this.gap2 = gap2  
        this.deltaHeight = deltaHeight
        this.position.set(0, 0, zPosition) 

        this.makeFloor(
            islandSize - .25, 
            islandSize - .5, 
            new Vector3(island.position.x, deltaHeight/2, gap1 + islandSize / 2)
        )

        // deco

        if (doGravel) {
            let gravel = clone("gravel2")
            let scale = islandSize / Config.WIDTH * 2.75
            
            gravel.rotate(Axis.Y, getRandomRotation())
            gravel.scaling.set(scale, 1, scale)
            gravel.position = island.position.clone()
            gravel.position.y = deltaHeight/2
            gravel.parent = this.group
        }

        if (doBush) {
            let bush = makePlant(scene)
            let direction = flip()

            bush.rotate(Axis.Z, direction * random.real(.25, .5))
            bush.position = island.position.clone()
            bush.position.y = random.real(-4, -3)
            bush.position.x -= (islandSize/2 - 1) * direction
            bush.parent = this.group
        }

        if (leftPlant) {
            let plants = makeWaterPlant(random.integer(1, 3)) 

            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                island.position.x + (islandSize + random.real(.5, 2)) * plantX, 
                -Config.FLOOR_DEPTH, 
                0
            )    
        }
         
        if (rightPlant) { 
            let plants = makeWaterPlant(random.integer(1, 3))
    
            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                island.position.x + (islandSize + random.real(.5, 2)) * -plantX, 
                -Config.FLOOR_DEPTH,
                0
            )
        }
    }
}
