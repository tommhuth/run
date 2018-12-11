import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, flip, getRandomRotation, explode, random } from "../../utils/utils"
import Full from "./Full" 
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../deco/makeRocks"
import makeTree from "../../deco/makeTree"

export default class Ruins extends PathwayBlock {
    requiredNext = [Full] 
    hasTriggeredCollapse = false 

    static isAcceptableNext(previous, path) {
        return super.isAcceptableNext(previous, path) && path.filter(i => i instanceof Ruins).length === 0
    } 
    constructor(scene, zPosition, {
        width = Config.WIDTH * 2 + 2,
        height = Config.HEIGHT,
        depth = Config.DEPTH * 2, 
        collapsable = random.bool(),
        columns = 2,
        columnFragments = 3,
        outerGap = 2.5,
        doTree = random.bool()
    } = {}) {
        super(scene, width, height, depth)

        const pillarGap = (depth - outerGap * 2) / (columns-1)
        const path = clone(random.pick(["path", "path2"]))
        const path2 = clone("path2")
        const path3 = clone("path2") 
        const gravel = clone("gravel")  
        const rocks = makeRocks(scene, {
            centerOffset: width,
            xOffset: 6,
            scale: 2,
            count: random.integer(0, 4),
            depth
        }) 
        
        this.group.position.set(0,0, zPosition)
 
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < columns; j++) {
                let foot = clone("pillarFoot") 
                let isFirstCollapsable = random.bool(60)
                let isSecondCollapsable = isFirstCollapsable && random.bool(80)
        
                foot.position.set(
                    (width/2 - 2.25) * (i === 0 ? -1 : 1), 
                    foot.height/2, 
                    outerGap + pillarGap * j 
                )
                foot.rotate(Axis.Y, getRandomRotation())
                foot.physicsImpostor = new Impostor(foot, Impostor.CylinderImpostor, { mass: isFirstCollapsable || !collapsable ? 0 : 200 }, scene) 
                foot.parent = this.group
        
                let totalHeight = foot.height
        
                for (let j = 0; j < columnFragments; j++) { 
                    let pillar = clone("pillar")
                    let scaleY = random.real(.45, 1.45) 
                    let height = pillar.height * scaleY
                    let mass = (isFirstCollapsable && j === 0) || (isSecondCollapsable && j === 1) || !collapsable ? 0 : 200 
        
                    pillar.scaling.y = scaleY
                    pillar.position.set(foot.position.x, totalHeight + height/2, foot.position.z)
                    pillar.rotate(Axis.Y, getRandomRotation())
                    pillar.physicsImpostor = new Impostor(pillar, Impostor.CylinderImpostor, { mass }, scene) 
        
                    pillar.parent = this.group
        
                    totalHeight += height  
                }
            }
        }

        resize(gravel, depth - 3, .4, depth - 3)
        gravel.position.set(3 / 2 * flip(), -.05, depth/2)
        gravel.rotate(Axis.Y, getRandomRotation())
        gravel.parent = this.group  
    
        rocks.position.set(0, -height, depth/2)
        rocks.parent = this.group 

        // right 
        resize(path2, 4, height, 6)
        path2.rotate(Axis.Y, random.real(-.15, .15))
        path2.position.x = random.real(4.5, 6)
        path2.position.y = -height/2 - random.real(0, 2)
        path2.position.z = depth/2 + random.real(-1.5, 1.5)
        path2.parent = this.group
        
        // left
        resize(path3, 4, height + 1, 4)
        path3.rotate(Axis.Y, random.real(-.15, .15))
        path3.position.x = -6
        path3.position.y = -height / 2 + random.real(-1, 1)
        path3.position.z = depth/2  
        path3.parent = this.group

        
        resize(path, width, height, depth) 
        path.rotate(Axis.Y, random.real(-.15, .15))
        path.position.set(0, -height/2, depth/2)  
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent = this.group  

        if (doTree) {
            const tree = makeTree()
            
            tree.position = path2.position.clone()
            tree.position.y += height/2
            tree.position.x += 1
            tree.parent = this.group
        }
        
        this.makeFloor(width, depth, new Vector3(0, 0, depth / 2))
    }
    beforeRender(player) {
        super.beforeRender(player)

        if (player.position.z > this.position.z - 10 && !this.hasTriggeredCollapse) {
            let explosionY = random.real(2, 2.25)
            let explosionX = random.real(7.5, 8)

            explode(this.scene, new Vector3(explosionX * -1, explosionY, this.position.z), 7, 15000)
            explode(this.scene, new Vector3(explosionX, explosionY, this.position.z), 7, 15000, 500)

            this.hasTriggeredCollapse = true 
        } 
    }
}
