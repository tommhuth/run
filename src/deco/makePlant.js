import { clone } from "../utils/modelLoader" 
import { random } from "../utils/utils"

export default function makePlant(scene, { 
    scale = random.real(1, 1.25)
} = {}){
    let trunk = clone("tree")
    let leaves = clone("leaves")

    leaves.parent = trunk 
    trunk.scaling.set(scale, scale, scale)

    return trunk
}
