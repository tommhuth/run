import { clone } from "../utils/modelLoader"
import { getRandomRotation } from "../utils/utils"
import { Axis } from "babylonjs"

export default function({ scale = 1 } = {}) {
    const tree = clone("tree2")
    const leaf = clone("leaves2")

    leaf.parent = tree  

    tree.scaling.set(1.5 * scale, 1.5 * scale, 1.5 * scale)
    tree.rotate(Axis.Y, getRandomRotation())
    
    return tree
}
