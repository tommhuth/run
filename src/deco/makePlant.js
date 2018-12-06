import { Axis } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, flip } from "../utils/utils"

export default function makePlant(scene, { 
    scale = 1 + Math.random() * .25,
} = {}){
    let trunk = clone("tree")
    let leaves = clone("leaves")

    leaves.parent = trunk 
    
    trunk.rotate(Axis.Y, getRandomRotation())
    trunk.rotate(Axis.X, Math.random() * .25 * flip())
    trunk.rotate(Axis.Z, Math.random() * .25 * flip())
    trunk.scaling.set(scale, scale, scale)

    return trunk
}
