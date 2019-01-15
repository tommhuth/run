import { clone } from "./models"
import makePlant from "./makePlant"
import { random, makeGroup, resize, getRandomRotation, flip } from "../utils/helpers"
import { Config } from "../stage/pathway/Pathway"
import { Axis, PhysicsImpostor as Impostor } from "babylonjs"

export default function({
    scene,
    radius = 1, 
    maxRadius = 2,
    height = Config.HEIGHT,  
    doGravel = random.bool(65) || radius >= 3.5,
    doBush = random.bool(65)
} = {}) {
    const group = makeGroup(scene)
    const island = clone(random.pick(["island", "island2", "island3"]))  

    resize(island, radius, height, radius) 

    island.physicsImpostor = new Impostor(island, Impostor.CylinderImpostor, { mass: 0 }, scene)
    island.parent = group
    island.rotate(Axis.Y, random.real(-Math.PI * 2, Math.PI * 2)) 

    if (doGravel) {
        let gravel = clone("gravel2")
        let scale = radius / maxRadius
        
        gravel.rotate(Axis.Y, getRandomRotation())
        gravel.scaling.set(scale, 1, scale)
        gravel.position = island.position.clone()
        gravel.position.y = height/2
        gravel.parent = group
    }

    if (doBush) {
        let bush = makePlant(scene)
        let direction = flip()

        bush.rotate(Axis.Z, direction * random.real(.25, .5))
        bush.position = island.position.clone()
        bush.position.y = random.real(0, -2)
        bush.position.x -= (radius / 2 - 1) * direction
        bush.parent = group
    }

    return {
        islandGroup: group,
        island
    }
}
