import { Axis, PhysicsImpostor as Impostor, Vector3, MeshBuilder } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getFlipRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway"  

export default class Tower extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path) && path.filter(i => i instanceof Tower).length === 0
    }
    constructor(scene, zPosition, {
        maxJumpDistance,
        width = random.real(Config.WIDTH, Config.WIDTH + 1.5),
        height = Config.HEIGHT + 1,  
        towerCount = random.integer(2, 3, true)
    } = {}) {
        super(scene, width, height) 
        
        let platformSize = 3.5
        let platformGap = maxJumpDistance - 1
        let gap1 = maxJumpDistance * 2
        let gap2 = maxJumpDistance * 3
        let depth = gap1 + platformSize/2
        let path = clone("path2")

        for (let i = 0; i < towerCount; i++) {
            let platform = clone("platform")  
            let pillar = MeshBuilder.CreateBox(null, { width: .75, depth: .75, height: 8 }, scene) 
            let butt =  clone("box")  
            let base =  clone("box")  
            let zPosition = depth
            let yPosition = random.real(-.5, .5)
 
            resize(platform, platformSize, .5, platformSize)
            resize(butt, 1, 1.5, 1)
            resize(base, 1.5, 3, 1.5) 

            platform.rotate(Axis.X, getFlipRotation())
            platform.rotate(Axis.Y, getFlipRotation())
            platform.rotate(Axis.Z, getFlipRotation())
            platform.position.set(random.real(-.5, .5), 2 + yPosition, zPosition)
            platform.physicsImpostor = new Impostor(platform, Impostor.BoxImpostor, { mass: 0 }, scene)
            platform.parent = this.group
    
            pillar.position.set(platform.position.x, -2 + yPosition, zPosition)
            pillar.physicsImpostor = new Impostor(pillar, Impostor.BoxImpostor, { mass: 0 }, scene)
            pillar.parent = this.group
            pillar.receiveShadows = true 
      
            butt.rotate(Axis.X, getFlipRotation())
            butt.rotate(Axis.Y, getFlipRotation())
            butt.rotate(Axis.Z, getFlipRotation())
            butt.position.set(platform.position.x, 1.25 + yPosition, zPosition) 
            butt.parent = this.group
            
            base.rotate(Axis.X, getFlipRotation())
            base.rotate(Axis.Y, getFlipRotation())
            base.rotate(Axis.Z, getFlipRotation())
            base.position.set(platform.position.x, -5, zPosition) 
            base.parent = this.group

            this.addCoinLine(
                2, 
                new Vector3(platform.position.x - .35, platform.position.y + .5, platform.position.z),
                new Vector3(platform.position.x + .35, platform.position.y + .5, platform.position.z),
                new Vector3(platform.position.x - .35, platform.position.y + .5, platform.position.z), 
            )

            if (i === 0 || i === towerCount - 1) { 
                let plank = clone("plank")

                if (i === 0) { 
                    resize(plank, gap1 + 2, .125, .75)
                    plank.position.set(
                        platform.position.x + random.real(-1, 1),
                        platform.position.y + 3,
                        gap1 / 2 - .5
                    )
                } else if (i === towerCount - 1) {  
                    resize(plank, gap2 + 2, .125, .7)
                    plank.position.set(
                        platform.position.x + random.real(-1, 1),
                        platform.position.y + 3,
                        depth + platformSize / 2 + gap2 / 2
                    )
                }

                plank.rotate(Axis.X, getFlipRotation())
                plank.rotate(Axis.Y, getFlipRotation())
                plank.rotate(Axis.Z, getFlipRotation())
                plank.physicsImpostor = new Impostor(plank, Impostor.BoxImpostor, { mass: 2 }, scene)
                plank.parent = this.group  
            }

            this.makeFloor(3, 3, new Vector3(platform.position.x, platform.position.y + .25, platform.position.z))
  
            depth += platformSize + (i === towerCount - 1 ? 0 : platformGap) 
        } 
 
        depth += gap2 

        resize(path, width - 1.5, height, Config.DEPTH - 1)

        path.position.set(0, -height/2 + .5,  depth)
        path.rotate(Axis.Y, random.real(-.2, .2))
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent= this.group
 
        this.makeFloor(
            width - 1.5, 
            Config.DEPTH - 1,
            new Vector3(path.position.x, path.position.y + height/2 + .15, path.position.z)
        )
  
        this.depth = depth 
        this.position.z = zPosition
    } 
}
