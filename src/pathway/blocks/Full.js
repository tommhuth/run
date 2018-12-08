import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getRandomRotation } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../deco/makeRocks"

export default class Full extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    constructor(scene, zPosition, {
        width = Config.WIDTH + Math.random() * 1.5,
        height = Config.HEIGHT,
        depth = Config.DEPTH,
        bufferDepth = 1,
        doCoins = Math.random() > .5,
        doObstacle = true,
    } = {}) {
        super(scene, width, height, depth) 

        let path = clone(randomList("path", "path2")) 
        let rocks = makeRocks(scene, { count: Math.random() * 3 + 1, centerOffset: width - 1, depth })
        let obsticalPosition 
     
        this.position.set(0, 0, zPosition) 

        rocks.position.y = -height
        rocks.parent = this.group

        resize(path, width, height, depth + bufferDepth)  
        path.position.set(0, -height/2, depth/2) 
        path.rotate(Axis.Y, Math.random() < .5 ? -Math.PI : 0) 
        path.rotate(Axis.Y, Math.random() * .2 * flip())
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent = this.group

        if (doObstacle) {
            const rock = clone("rock")
            const size = Math.random() * 1 + .5
            const gravel = clone("gravel")
             
            resize(rock, size, size, size)
            rock.position.set(
                ((width/2 - 3) * Math.random() + 1) * flip(), 
                0, 
                (depth - 2) * Math.random() + 1 
            )
            rock.rotation.set(getRandomRotation(), getRandomRotation(), getRandomRotation())
            rock.physicsImpostor = new Impostor(rock, Impostor.SphereImpostor, { mass: 0 }, scene)
            rock.parent = this.group  
            
            gravel.rotate(Axis.Y, getRandomRotation())
            gravel.scaling.set(2, 2, 2)
            gravel.position.set(0, Math.random() * -.1, depth/2)
            gravel.parent = this.group

            obsticalPosition = rock.position.clone()
        }

        if (doCoins) { 
            this.addCoinLine(
                3, 
                new Vector3(0, 0, 0), 
                new Vector3(0, 0, depth - 2), 
                new Vector3(obsticalPosition ? obsticalPosition.x * -1.5 : 0, .25, 1)
            )
        }

        this.makeFloor(width, depth, new Vector3(0, 0, depth/2))
    } 
}
