import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs" 
import { box, clone, boxed } from "../../utils/modelLoader"
import { random } from "../../utils/utils"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"

/*
WIDTH: 8, 
    BASE_HEIGHT: 20,
    DEPTH: 8,
    FLOOR_DEPTH: 4.5

    */
export const Pattern = {
    PLAIN:[ ], 
    ISLAND:[ 
    ], 
}


export default class Full extends PathwayBlock { 
    width = Config.WIDTH 
    depth = Config.DEPTH 
    patterns = [ 
        [
            {
                width: 1, depth: 10, height: 1, x: 0, z: 0, y: 0
            }
        ]
    ]
    
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path)
    }
    constructor(scene, zPosition) { 
        super(scene)
 /*
        const base = box(scene, { height: Config.BASE_HEIGHT, width: this.width, depth: this.depth }) 
  
        base.position.z = this.depth / 2 
        base.position.y = -Config.BASE_HEIGHT / 2 
        base.position.x = 0
        base.physicsImpostor = new Impostor(base, Impostor.BoxImpostor, { mass: 0 }, scene) 
        base.parent = this.group
*/
        let boxd = boxed(scene, this.width, 1, this.depth)

        boxd.position.x = -this.width / 2 + .5
        boxd.position.y = -.5
        boxd.position.z = .5
        boxd.parent = this.group

        this.position.z = zPosition  

        this.floor.push(boxd.tmp)
        this.buildLayers(random.pick(this.patterns)) 
    } 
    buildLayers(type) {
        this.type = type 

        for (let { x = 0, y = 0, z = 0, width = 1, height = 1, depth = 1 } of type) {
            const block = boxed(this.scene, height, width, depth ) 

            block.position.set(
                x - this.width/2 + .5,
                y +.5,
                z + .5 
            )
            //block.physicsImpostor = new Impostor(block, Impostor.BoxImpostor, { mass: 0 }, this.scene) 
            block.parent = this.group

            this.floor.push(block.tmp)
        }
    }
}
