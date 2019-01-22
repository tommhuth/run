import { Axis, PhysicsImpostor as Impostor, Vector3, MeshBuilder } from "babylonjs"
import { clone } from "../../../builders/models"
import { resize, getFlipRotation, random } from "../../../utils/helpers"
import PathwayBlock from "../PathwayBlock" 
import { Config } from "../Pathway" 
import Full from "./Full"

export default class Tower extends PathwayBlock { 
    static isAcceptableNext(type, path){
        return super.isAcceptableNext(type, path) && type instanceof Full
    }
    constructor(scene, zPosition, {
        width = random.real(Config.WIDTH, Config.WIDTH + 1.5),
        height = Config.HEIGHT + 1,  
        towerCount = random.integer(2, 4, true)
    } = {}) {
        super(scene, width, height) 
        // this needs cleaing up
        let platformSize = 3 
        let depth = 8
        let path = clone("path2")

        for (let i = 0; i < towerCount; i++) {
            let platform = clone("platform")  
            let pillar = MeshBuilder.CreateBox(null, { width: .75, depth: .75, height: 8 }, scene) 
            let butt =  clone("box")  
            let base =  clone("box")  
            let zPosition = depth + i * platformSize * 2

            resize(platform, platformSize, .5, platformSize)
            resize(butt, 1, 1.5, 1)
            resize(base, 1.5, 3, 1.5) 

            platform.rotate(Axis.X, getFlipRotation())
            platform.rotate(Axis.Y, getFlipRotation())
            platform.rotate(Axis.Z, getFlipRotation())
            platform.position.set(random.real(-.5, .5), 2, zPosition)
            platform.physicsImpostor = new Impostor(platform, Impostor.BoxImpostor, { mass: 0 }, scene)
            platform.parent = this.group
    
            pillar.position.set(platform.position.x, -2, zPosition)
            pillar.physicsImpostor = new Impostor(pillar, Impostor.BoxImpostor, { mass: 0 }, scene)
            pillar.parent = this.group
            pillar.receiveShadows = true 
      
            butt.rotate(Axis.X, getFlipRotation())
            butt.rotate(Axis.Y, getFlipRotation())
            butt.rotate(Axis.Z, getFlipRotation())
            butt.position.set(platform.position.x, 1.25, zPosition) 
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
                    resize(plank, 7.75, .125, .75)
                    plank.position.set(random.real(-1, 1), 3, 3)
                } else if (i === towerCount - 1) {  
                    resize(plank, 8, .125, .7)
                    plank.position.set(random.real(-1, 1), 3, zPosition + 5)
                }

                plank.rotate(Axis.X, getFlipRotation())
                plank.rotate(Axis.Y, getFlipRotation())
                plank.rotate(Axis.Z, getFlipRotation())
                plank.physicsImpostor = new Impostor(plank, Impostor.BoxImpostor, { mass: 1 }, scene)
                plank.parent = this.group  
            }

            this.makeFloor(3, 3, new Vector3(platform.position.x, platform.position.y + .25, platform.position.z))
 
        } 
 
        resize(path, width - 1.5, height, Config.DEPTH -1)

        path.position.set(0, -height/2 + .5,  depth + towerCount * 6 + Config.DEPTH / 2)
        path.rotate(Axis.Y, random.real(-.2, .2))
        path.physicsImpostor = new Impostor(path, Impostor.BoxImpostor, { mass: 0 }, scene)
        path.parent= this.group

        this.depth = depth + towerCount * 6 + Config.DEPTH -1
        this.position.z = zPosition
    } 
}
