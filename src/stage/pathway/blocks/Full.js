import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getRandomRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../../builders/makeRocks"

export default class Full extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    constructor(scene, zPosition, {
        width = random.real(Config.WIDTH, Config.WIDTH + 1.5),
        height = Config.HEIGHT,
        depth = Config.DEPTH,
        bufferDepth = 1,
        doCoins = random.bool(),
        doObstacle = !doCoins,
    } = {}) {
        super(scene, width, height, depth) 

        let path = clone(random.pick(["path", "path2", "path3"])) 
        let rocks = makeRocks(scene, { count: random.integer(1, 5), centerOffset: width - 1, depth })
     
        this.position.set(0, 0, zPosition) 

        rocks.position.y = -height
        rocks.parent = this.group

        resize(path, width, height, depth + bufferDepth)  
        path.rotate(Axis.Y, random.pick([0, -Math.PI])) 
        path.rotate(Axis.Y, random.real(-.2, .2))
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0, ignoreParent: true }, scene)
        path.parent = this.group
        path.position.set(0, -height/2, depth/2) 

        if (doObstacle) {
            const rock = clone("rock")
            const size = random.real(.5, 1.5)
            const gravel = clone("gravel")
             
            resize(rock, size, size, size)
            rock.physicsImpostor = new Impostor(rock, Impostor.SphereImpostor, { mass: 0, ignoreParent: true }, scene)
            rock.parent = this.group  
            rock.position.set(
                random.real(-1, 1),
                0, 
                random.real(1, depth - 2)
            )
            rock.rotation.set(getRandomRotation(), getRandomRotation(), getRandomRotation())
            
            gravel.rotate(Axis.Y, getRandomRotation())
            gravel.scaling.set(2, 2, 2)
            gravel.position.set(0, -random.real(.05, 0), depth / 2)
            gravel.parent = this.group
        } else { 
            this.addCoinLine(
                3, 
                new Vector3(0, 0, 0), 
                new Vector3(0, 0, depth - 2), 
                new Vector3(0, .25, 1)
            )
        }

        this.makeFloor(width, depth, new Vector3(0, 0, depth/2))
    } 
}
