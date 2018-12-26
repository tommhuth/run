import { Axis } from "babylonjs"
import { clone } from "../utils/modelLoader"
import { getRandomRotation, makeGroup, flip, random } from "../utils/utils"

export default function makeRocks(scene, {
    centerOffset, 
    depth,
    count = random.integer(1, 3), 
    xOffset = 8,
    scale = 1,
} = {}){
    let group = makeGroup(scene)

    for (let i = 0; i < count; i++) {
        let rock = clone(random.pick(["rock", "rock2"]))
        let scaling = random.real(.5, 2)
        let scalingY = random.real(.85, 2)

        rock.scaling.set(scaling * scale, scalingY * scale, scaling * scale)
        rock.rotate(Axis.Y, getRandomRotation())
        rock.rotate(Axis.X, random.real(-.25, .25))
        rock.rotate(Axis.Z,random.real(-.25, .25))
        rock.position.x = (centerOffset/2 + random.real(0, xOffset)) * flip()
        rock.position.y = 0
        rock.position.z = random.real(0, depth)
        rock.parent = group
    } 

    return group
}
