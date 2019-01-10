import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, getRandomRotation, random } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import Full from "./Full"

export default class Marsh extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path) && path.filter(i => i instanceof Marsh).length === 0
    } 
    requiredNext = [Full]
    constructor(scene, zPosition, {
        width = Config.WIDTH,
        height = Config.HEIGHT,
        marshDepth = 30,
    } = {}) {
        super(scene, width, height, marshDepth) 

        let path2 = clone("seafloor")   
        let diameter = 9
        let obstacleSegmentSize = 4
        let obstacleCount = Math.floor(marshDepth / obstacleSegmentSize)
        let staircaseDepth = this.makeStaircase(marshDepth, height)
 
        resize(path2, diameter, marshDepth + 4, diameter) 
  
        this.position.set(0, -Config.FLOOR_DEPTH, zPosition)

        path2.rotate(Axis.Z, -Math.PI / 2) 
        path2.rotate(Axis.X, Math.PI / 2)
        path2.rotate(Axis.Y, getRandomRotation()) 
        path2.physicsImpostor = new Impostor(path2, Impostor.CylinderImpostor, { mass: 0 }, scene)
        path2.parent = this.group
        path2.position.set(0,  -diameter/2 -.1, marshDepth / 2) 
        
        this.depth += staircaseDepth
        this.makeFloor(width - 1.5, marshDepth, new Vector3(0, path2.position.y + diameter/2, marshDepth/2))
        this.makeObstacles(obstacleCount, obstacleSegmentSize)
    }
    makeStaircase(marshDepth, height) {
        let staircaseDepth = 0 

        for (let i = 0; i < 6; i++) { 
            let island = clone(random.pick(["island", "island2", "island3"])) 
            let islandSize = i === 0 ? 4 : random.real(2, 4)
            let gap = 2
            let doGravel = random.bool(.8)

            resize(island, islandSize, height, islandSize)

            island.rotate(Axis.Y, getRandomRotation())
            island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, this.scene)
            island.parent = this.group
            island.position.set(
                i === 0 ? 0 : random.real(-1, 1),
                i * 1 - height/2 + .5,
                i === 0 ? marshDepth + 2 : marshDepth + islandSize / 2 + staircaseDepth  
            )

            if (doGravel) {
                let gravel = clone("gravel2")
                let scale = islandSize / Config.WIDTH * 2.75
                
                gravel.rotate(Axis.Y, getRandomRotation())
                gravel.scaling.set(scale, 1, scale)
                gravel.position = island.position.clone() 
                gravel.position.y += height/2 
                gravel.parent = this.group
            }
  
            this.makeFloor(
                islandSize,
                islandSize,
                new Vector3(island.position.x, island.position.y + height/2, island.position.z)
            )
            
            staircaseDepth += islandSize + gap
        } 

        return staircaseDepth
    }
    makeObstacles(segments, segmentSize) { 
        let lastWasCoins = false 

        for (let i = 0; i < segments; i++) {
            if (random.bool(.5) && i >= 2 && i < segments - 1 && !lastWasCoins) { 
                this.addCoinLine(
                    3, 
                    new Vector3(0, 0, i * segmentSize ),
                    new Vector3(0, 0, i * segmentSize + 2),
                    new Vector3(0, 0, i * segmentSize)
                )

                lastWasCoins = true
            } else {
                let rock = clone("rock")
                let scale = random.real(.75, 1.5)
                let xPosition = random.real(-2.5, 2.5)
    
                rock.scaling.set(scale, scale + random.real(0, .5), scale)
                rock.physicsImpostor = new Impostor(rock, Impostor.SphereImpostor, { mass: 0 }, this.scene)
                rock.parent = this.group
                rock.position.set(
                    xPosition,
                    -Math.abs(xPosition) / 2 - random.real(0, .5),
                    i * segmentSize + segmentSize/2
                )

                lastWasCoins = false 
            }
        }
    }
}
