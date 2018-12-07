import { clone } from "../utils/modelLoader" 

export default function makePlant(scene, { 
    scale = 1 + Math.random() * .25,
} = {}){
    let trunk = clone("tree")
    let leaves = clone("leaves")

    leaves.parent = trunk 
    trunk.scaling.set(scale, scale, scale)

    return trunk
}
