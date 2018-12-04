import { Vector3, Axis, MeshBuilder, StandardMaterial, Color3 } from "babylonjs"
import { makeGroup, resize } from "../utils/utils"
import { clone } from "../utils/modelLoader"

export default class PathwayBlock {
    illegalNext = []
    requiredNext = []
    coins = []
    width = 0
    height = 0
    depth = 0
    floor = []

    static isAcceptableNext(_previous, _path) { 
        return true
    }
    constructor(scene, width = 0, height = 0, depth = 0) { 
        this.scene = scene
        this.group = makeGroup(scene, true) 
        this.width = width
        this.height = height 
        this.depth = depth        
    }
    get position() {
        return this.group.position
    }
    makeFloor(width, depth, position, box = true){
        let floor 

        if (box) {
            floor = MeshBuilder.CreateBox(1, { width, depth, height: .25 }, this.scene)
        } else {
            floor = MeshBuilder.CreateCylinder(1, { diameter: width, height: .25, tessellation: 10 }, this.scene)
        }
         
        let mat = new StandardMaterial(1, this.scene )
        
        mat.diffuseColor = Color3.Red()
        floor.material = mat

        floor.visibility = .25

        floor.position = position
        floor.position.y -= .125
        floor.parent = this.group

        this.floor.push(floor)
    }
    canAcceptNext(nextType, _path){
        return this.illegalNext.length ? !this.illegalNext.includes(nextType) : true
    } 
    remove() {
        this.group.dispose()
    }
    addCoins(count, positionCallback){
        for (let i = 0; i < count; i++) {
            let coin = clone("coin") 
            
            resize(coin, .3, .6, .3)
    
            coin.time = i * .01
            coin.position = positionCallback(i, count) 
            coin.parent = this.group

            this.coins.push(coin)

            this.group.intersectsMesh()
        }
    }
    beforeRender(player) {  
        for (let coin of this.coins) {
            let distance = Vector3.DistanceSquared(coin.getAbsolutePosition(), player.getAbsolutePosition())

            coin.rotate(Axis.Y, coin.rotation.y + .075)

            if (distance < .5) {
                player.score++ 
                coin.dispose() 
                this.coins = this.coins.filter(i => i !== coin)
            }
        }
    }
}
