import { Axis } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, makeGroup, random } from "../utils/utils"

export default function (amount = 2) {
    const group = makeGroup()
    const basePlant = clone("plant")
    const baseScale = random.real(.5, 1.5)
    const baseR = basePlant.depth * baseScale / 2
    const rotations = []

    basePlant.rotate(Axis.Y, getRandomRotation())
    basePlant.parent = group 
    basePlant.position.set(0, 0, 0)
    basePlant.scaling.x = baseScale
    basePlant.scaling.z = baseScale

    for (let i = 0; i < amount - 1; i++) {
        const plant = clone("plant")
        const ownScale = random.real(.15, .65)
        const ownRadius = plant.depth * ownScale / 2
        const diff = random.real(0, .5)
        const rotation = 360 / (amount - 1) * i
        
        plant.rotate(Axis.Y, getRandomRotation())
        plant.parent = group
        plant.scaling.x = ownScale
        plant.scaling.z = ownScale
        plant.position.x = (baseR + ownRadius + diff) * Math.cos(rotation)
        plant.position.z = (baseR + ownRadius + diff) * Math.sin(rotation)
        plant.position.y = 0
        plant.i = 0
 
        rotations.push(rotation)
    }

    return group
}
