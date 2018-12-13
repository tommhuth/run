import { clone } from "../utils/modelLoader"
import { getRandomRotation } from "../utils/utils"
import { Axis, Vector3 } from "babylonjs"

export default function({ scale = 1 } = {}) {
    const tree = clone("tree2")
    const leaves = clone("leaves2")

    leaves.parent = tree  
    leaves.position = Vector3.Zero()
    tree.scaling.set(1.5 * scale, 1.5 * scale, 1.5 * scale)
    tree.rotate(Axis.Y, getRandomRotation())
    
    return tree
}
