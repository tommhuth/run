import { Axis, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import { clone } from "../../utils/modelLoader"
import { resize, randomList, flip, getRandomRotation, explode } from "../../utils/utils"
import Full from "./Full" 
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"
import makeRocks from "../../deco/makeRocks"

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
        collapsable = Math.random() > .5,
        columns = 2,
        columnFragments = 3,
        outerGap = 2.5
    } = {}) {
        super(scene, width, height, depth)

        const pillarGap = (depth - outerGap * 2) / (columns-1)
        const path = clone(randomList("path"))
        const path2 = clone("path2")
        const path3 = clone("path2") 
        const gravel = clone("gravel") 
        const rocks = makeRocks(scene, {
            centerOffset: width,
            xOffset: 6,
            scale: 2,
            count: Math.random() * 4,
            depth
        }) 
        
        this.group.position.set(0,0, zPosition)
 
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < columns; j++) {
                let foot = clone("pillarFoot") 
                let is = Math.random() > .4 
                let isSecond = is && Math.random() > .2
        
                foot.position.set(
                    (width/2 - 2.25) * (i === 0 ? -1 : 1), 
                    foot.height/2, 
                    outerGap + pillarGap * j 
                )
                foot.rotate(Axis.Y, getRandomRotation())
                foot.physicsImpostor = new Impostor(foot, Impostor.CylinderImpostor, { mass: is || !collapsable ? 0 : 200 }, scene) 
                foot.parent = this.group
        
                let totalHeight = foot.height
        
                for (let j = 0; j < columnFragments; j++) { 
                    let pillar = clone("pillar")
                    let scaleY = Math.random() * 1 + .45
                    let height = pillar.height * scaleY
                    let mass = (is && j === 0) || (isSecond && j === 1) || !collapsable ? 0 : 200 
        
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
        path2.rotate(Axis.Y, Math.random() * .15 * flip())
        path2.position.x = 4.5 + Math.random() * 1.5
        path2.position.y = -height/2 - Math.random() * 2
        path2.position.z = depth/2 + Math.random() * 1.5 * flip()
        path2.parent = this.group
        
        // left
        resize(path3, 4, height + 1, 4)
        path3.rotate(Axis.Y, Math.random() * .15 * flip())
        path3.position.x = -6
        path3.position.y = -height / 2 + (Math.random() * flip())
        path3.position.z = depth/2  
        path3.parent = this.group
        
        resize(path, width, height, depth) 
        path.rotate(Axis.Y, Math.random() * .15 * flip())
        path.position.set(0, -height/2, depth/2)  
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent = this.group  

        this.makeFloor(width, depth, new Vector3(0, 0, depth / 2))
    }
    beforeRender(player) {
        super.beforeRender(player)

        if (player.position.z > this.position.z - 10 && !this.hasTriggeredCollapse) {
            explode(this.scene, new Vector3(-7 - Math.random() * .5, 2 + Math.random() * .25, this.position.z), 7, 15000)
            explode(this.scene, new Vector3(7.5 + Math.random() * .5, 2 + Math.random() * .25, this.position.z), 7, 15000, 500)

            this.hasTriggeredCollapse = true 
        } 
    }
}
