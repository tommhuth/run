import { Axis, PhysicsImpostor as Impostor, Vector2, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip } from "../../utils/utils"
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
        bufferDepth = 1
    } = {}) {
        super(scene, width, height, depth) 

        const path = clone(randomList("path", "path2")) 
        const rocks = makeRocks(scene, { count: Math.random() * 3 + 1, centerOffset: width - 1, depth })

        this.position.set(0, 0, zPosition) 

        rocks.position.y = -height
        rocks.parent = this.group

        resize(path, width, height, depth + bufferDepth)  
        path.position.set(0, -height/2, depth/2) 
        path.rotate(Axis.Y, Math.random() < .5 ? -Math.PI : 0) 
        path.rotate(Axis.Y, Math.random() * .2 * flip())
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent = this.group

        this.makeFloor(width, depth, new Vector3(0, 0, depth/2))
    } 
}
