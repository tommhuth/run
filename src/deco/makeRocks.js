import { Axis } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, makeGroup, flip, randomList } from "../utils/utils"

export default function makeRocks(scene, {
    centerOffset, 
    depth,
    count = Math.ceil(Math.random() * 3), 
    xOffset = 8,
    scale = 1,
} = {}){
    let group = makeGroup(scene)

    for (let i = 0; i < count; i++) {
        let rock = clone(randomList("rock", "rock2"))
        let scaling = Math.random() * 1.5 + .5
        let scalingY = Math.max(Math.random() * 1.5 + .5, .85)

        rock.scaling.set(scaling * scale, scalingY * scale, scaling * scale)
        rock.rotate(Axis.Y, getRandomRotation())
        rock.rotate(Axis.X, Math.random() * .25 * flip())
        rock.rotate(Axis.Z, Math.random() * .25 * flip())
        rock.position.x = (centerOffset/2 + Math.random() * xOffset) * flip()
        rock.position.y = 0
        rock.position.z = depth * Math.random() / 2 * flip()
        rock.parent = group
    } 

    return group
}
