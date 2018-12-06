import { Axis } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, makeGroup } from "../utils/utils"

export default function (amount = 2) {
    const group = makeGroup()
    const basePlant = clone("plant")
    const baseScale = Math.random() + .25
    const baseR = basePlant.depth * baseScale / 2
    const rotations = []

    basePlant.rotate(Axis.Y, getRandomRotation())
    basePlant.parent = group 
    basePlant.position.set(0, 0, 0)
    basePlant.scaling.x = baseScale
    basePlant.scaling.z = baseScale

    for (let i = 0; i < amount - 1; i++) {
        const plant = clone("plant")
        const ownScale = Math.random() * .5 + .15
        const ownR = plant.depth * ownScale / 2
        const diff = Math.random() * .5
        const rotation = 360/(amount - 1) * i
        
        plant.rotate(Axis.Y, getRandomRotation())
        plant.parent = group
        plant.scaling.x = ownScale
        plant.scaling.z = ownScale
        plant.position.x = (baseR + ownR + diff) * Math.cos(rotation)
        plant.position.z = (baseR + ownR + diff) * Math.sin(rotation)
        plant.position.y = 0
        plant.i = 0
 
        rotations.push(rotation)
    }

    return group
}
