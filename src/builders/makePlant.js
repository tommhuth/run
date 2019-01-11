import { clone } from "./models" 
import { random } from "../utils/helpers"
import { Vector3 } from "babylonjs"
 
export default function makePlant(scene, { 
    scale = random.real(1, 1.25)
} = {}){
    let trunk = clone("tree")
    let leaves = clone("leaves")

    leaves.position = Vector3.Zero()
    leaves.parent = trunk 
    trunk.scaling.set(scale, scale, scale)

    return trunk
}
