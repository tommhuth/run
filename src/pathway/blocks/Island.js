import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getRandomRotation } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock"  
import { Config } from "../Pathway"
import Gap from "./Gap"
import HighIsland from "./HighIsland"
import makeWaterPlant from "../../deco/makeWaterPlant"
import Bridge from "./Bridge"

export default class Island extends PathwayBlock {
    illegalNext = [Gap, HighIsland, Bridge]  
    gap1
    gap2 
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        lastWasSame = false,
        islandSize = Math.max(Config.WIDTH * Math.random(), 2.25),
        height = Config.HEIGHT, 
        gapSize = Math.max(maxJumpDistance * Math.random() - 1, 2.5),
        leftPlant = Math.random() > .5,
        rightPlant = Math.random() > .5,
        plantX = flip(),
    } = {}) {  
        const gap1 = lastWasSame ? 0 : gapSize
        const gap2 = gapSize  
        const depth = islandSize + gap1 + gap2   
        const type = randomList("island", "island2", "island3")
        const island = clone(type) 
 
        super(scene, islandSize, height, depth)
        
        resize(island, islandSize, height, islandSize)

        island.rotate(Axis.Y, Math.random() * Math.PI * flip())
        island.position.set(
            Math.random() * 1.5 * flip(),
            -height / 2, 
            gap1 + islandSize / 2
        )  
        island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, scene)
        island.parent = this.group
         
        this.gap1 = gap1
        this.gap2 = gap2  
        this.position.set(0, 0, zPosition) 

        this.makeFloor(
            islandSize - .25, 
            islandSize - .5, 
            new Vector3(island.position.x, type === "island3" ? -.3 : 0, gap1 + islandSize / 2)
        )

        if (leftPlant) {
            const plants = makeWaterPlant(Math.floor(Math.random() * 3) + 1) 

            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                island.position.x + (islandSize + Math.random() * 1.5 + .5) * plantX, 
                -height, 
                0
            )    
        }
         
        if (rightPlant) { 
            const plants = makeWaterPlant(Math.floor(Math.random() * 3) + 1)
    
            plants.parent = this.group
            plants.rotate(Axis.Y, getRandomRotation())
            plants.position.set(
                island.position.x + (islandSize + Math.random() * 1.5 + .5) * -plantX, 
                -height, 
                0
            )
        }
    }
}
