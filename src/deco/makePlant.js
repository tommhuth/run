import { Axis, Angle } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, makeGroup, flip } from "../utils/utils"

export default function makePlant(scene, { 
    leafCount = 6, 
    radius = 360,
    animated = true, 
} = {}){
    let group = makeGroup(scene, animated) 
    let leafs = []

    for (let i = 0; i < leafCount; i++) { 
        let leaf = clone("leaf")
        let perLeaf = radius / leafCount
        let scale =  Math.random() * .75 + .5
        let rotation = Angle.FromDegrees(perLeaf * i)

        leaf.position.x = Math.random() * .25 * flip()   
        leaf.position.z = Math.random() * .25 * flip() 
        leaf.position.y = 0
        leaf.scaling.set(scale, scale, scale)
        leaf.rotate(Axis.Y, rotation.radians()) 
        leaf.rotate(Axis.Z, Math.random() / 100 * flip()) 
        leaf.parent = group

        leaf.time = Math.random() / 100 * flip()

        leafs.push(leaf)
    }

    if (animated) { 
        group.registerBeforeRender(() => {
            for (let leaf of leafs) {
                leaf.time += .01
                leaf.addRotation(0, 0, Math.sin(leaf.time) / 2000)
            }
        })
    }

    group.rotate(Axis.Y, getRandomRotation()) 

    return group
}
