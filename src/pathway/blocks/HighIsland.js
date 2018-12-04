import { Axis, PhysicsImpostor as Impostor, Vector2, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getRandomRotation } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import Gap from "./Gap" 
import { Config } from "../Pathway"
import Island from "./Island"
import makePlant from "../../deco/makePlant"
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
        coinCount = 5,
        baseDiamter = 2,
        plant = true,
        plantOffset = 4,
        forceSecondPlant = false
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
                new Vector3(island.position.x, island.position.y + height/2, island.position.z), 
                true
            )
            
            if (plant) { 
                const plant = makePlant(scene, { animated: false })
                const scale = Math.random() * .4 + .4
                
                plant.rotate(Axis.Y, getRandomRotation()) 
                plant.position.z = island.position.z - height/2
                plant.position.y = island.position.y - height/2
                plant.position.x = island.position.x + (plantOffset * flip())
                plant.parent = this.group 
                plant.scaling.set(scale, scale, scale)

                if (forceSecondPlant || Math.random() < .5) {
                    const plant2 = makePlant(scene, { leafCount: 3 })

                    plant2.rotate(Axis.Y, getRandomRotation()) 
                    plant2.position = plant.position.clone()
                    plant2.position.x *= -1.25
                    plant2.parent = this.group
                }
            }
            
            islands.push({ island, diameter, height })
            totalDepth += gap + diameter 
        }

        this.position.set(0, 0, zPosition) 
        this.depth = totalDepth + maxJumpDistance - 1  
/*
        this.addCoins(coinCount, (i) => {
            let { diameter, island, height } = islands[islands.length - 1]
            let y = Math.cos(Math.PI / coinCount * i) + (height- Config.HEIGHT) /2
            let z = island.position.z + diameter / 2 + i + .5

            return new Vector3(island.position.x, y, z)
        }) */
    } 
}
