import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs" 
import { box } from "../../utils/modelLoader"
import { random } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"

export default class Full extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    constructor(scene, zPosition, {
        width =  Config.WIDTH,
        height = Config.BASE_HEIGHT,
        depth = Config.DEPTH,
        obstructions = random.real(0, 6),
    } = {}) {
        super(scene, width, height, depth)

        const base = box(scene, { height, width, depth }) 

        base.position.z = depth/2
        base.position.y = -height/2 
        base.physicsImpostor = new Impostor(base, Impostor.BoxImpostor, { mass: 0 }, scene) 
        base.parent = this.group 

        for (let i = 0; i < obstructions; i++) {
            let obstruction = box(scene)

            obstruction.position.x = random.integer(-width/2 + 1, width/2 - 1) - .5
            obstruction.position.z = random.integer(1, depth) - .5
            obstruction.position.y = .5
            obstruction.physicsImpostor = new Impostor(obstruction, Impostor.BoxImpostor, { mass: 0 }, scene) 
            obstruction.parent = this.group 
            this.floor.push(obstruction)
        }

        this.position.z = zPosition

        this.floor.push(base)
    } 
}
