import { Axis, PhysicsImpostor as Impostor, Vector2, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getRandomRotation } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import Gap from "./Gap" 
import { Config } from "../Pathway"
import Island from "./Island"
import makePlant from "../../deco/makePlant"
import makeWaterPlant from "../../deco/makeWaterPlant"
import Bridge from "./Bridge"

export default class HighIsland extends PathwayBlock {
    illegalNext = [Gap, Island, Bridge]  

    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    constructor(scene, zPosition, { 
        maxJumpDistance, 
        lastWasSame = false, 
        islandsCount = 3, 
        baseDiamter = 2,
        doPlant = true,
        plantOffset = 6,
        doCoins = Math.random() > .5
    } = {}) {
        super(scene)

        let islands = []
        let totalDepth = 0

        for (let i = 0; i < islandsCount; i++) {
            const island = clone(randomList("island", "island2"))
            const height = Config.HEIGHT + i/2
            const diameter = baseDiamter + Math.random()
            const rock = clone(randomList("rock", "rock2"))
            const gap = lastWasSame && i === 0 ? 0 : maxJumpDistance - 1

            resize(rock, diameter + 1.5, diameter + 2, diameter + 1.5)
            resize(island, diameter, height, diameter)
  
            island.diameter = diameter
            island.rotate(Axis.Y, getRandomRotation()) 
            island.position.y = -Config.HEIGHT + height/2
            island.position.x = i === 0  || i === 2 ? 0 : Math.random() * flip()
            island.position.z = gap + diameter/2 +  totalDepth 
            island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, scene)
            island.parent = this.group

            rock.rotate(Axis.Y, getRandomRotation()) 
            rock.position = island.position.clone()
            rock.position.y = island.position.y - height/2
            rock.parent = this.group

            this.makeFloor(
                diameter - .25, 
                diameter - .5, 
                new Vector3(island.position.x, island.position.y + height/2, island.position.z)
            )

            if (i === 1 && doCoins) { 
                let previous = islands[i-1].island.position.clone()
                
                this.addCoinLine(
                    3,
                    new Vector3(previous.x, previous.y, previous.z + 1 ),
                    new Vector3(island.position.x, island.position.y, island.position.z - 1 ), 
                    new Vector3(previous.x, previous.y + height/2 + .5, previous.z), 
                )
            }
            
            if (doPlant && Math.random() > .5) { 
                const plant = makeWaterPlant(Math.random() * 2 + 1) 
                
                plant.rotate(Axis.Y, getRandomRotation()) 
                plant.position.z = island.position.z - height/2
                plant.position.y = island.position.y - height/2
                plant.position.x = island.position.x + ((Math.random() * plantOffset + 1.5) * flip())
                plant.parent = this.group   

                if (Math.random() < .65) {
                    const plant2 = makePlant(scene)
                    const dir = flip()
 
                    plant2.rotate(Axis.Z, dir * (Math.random() * .25 + .25)) 
                    plant2.position = island.position.clone()
                    plant2.position.y = Math.random() * -1 - 3
                    plant2.position.x -= (diameter/2 - .5) * dir
                    plant2.parent = this.group
                }
            }
            
            islands.push({ island, diameter, height })
            totalDepth += gap + diameter 
        }

        this.position.set(0, 0, zPosition) 
        this.depth = totalDepth + maxJumpDistance - 1 
    } 
}
