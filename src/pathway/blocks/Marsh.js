import { Axis, PhysicsImpostor as Impostor, Vector3, MeshBuilder } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, getRandomRotation, random } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../deco/makeRocks"
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
        obstacleCount = 6
    } = {}) {
        super(scene, width, height, marshDepth) 

        let path = MeshBuilder.CreateCylinder(null, { diameter: 8, height: marshDepth + 4 }, scene) 
        let staircaseDepth = 0
  
        this.position.set(0, -Config.FLOOR_DEPTH, zPosition)

        path.position.set(0, -4.45, marshDepth / 2)
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.rotate(Axis.Z, -Math.PI / 2) 
        path.rotate(Axis.X, Math.PI / 2)
        path.parent = this.group
        path.visibility = 1

        for (let i = 0; i < obstacleCount; i++) {
            let rock = clone("rock")
            let scale = random.real(.85, 1.5)

            rock.scaling.set(scale, random.real(.75, 1.75), scale)
            rock.position.set(
                random.real(-2.5, 2.5),
                random.real(-.25, -1.5),
                i / obstacleCount * (marshDepth - 8) + 6
            )
            rock.physicsImpostor = new Impostor(rock, Impostor.SphereImpostor, { mass: 0 }, scene)
            rock.parent = this.group
        }

        for (let i = 0; i < 6; i++) { 
            let island = clone(random.pick(["island", "island2", "island3"])) 
            let islandSize = 4
            let gap = 2

            resize(island, islandSize, height, islandSize)

            island.position.set(
                i === 0 ? 0 : random.real(-.5, .5),
                i * 1 - height/2,
                i === 0 ? marshDepth + 2 : marshDepth + islandSize / 2 + staircaseDepth  
            )
            island.rotate(Axis.Y, getRandomRotation())
            island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, scene)
            island.parent = this.group
            
            staircaseDepth += islandSize + gap

            let pos = island.position.clone()
            pos.y += height/2

            this.makeFloor(islandSize, islandSize, pos)
        } 
        
        this.depth += staircaseDepth
        this.makeFloor(width - 1.5, marshDepth, new Vector3(0, path.position.y + 4.1, marshDepth/2))
    } 
}
