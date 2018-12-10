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
        this.group = makeGroup(scene, false) 
        this.width = width
        this.height = height 
        this.depth = depth        
    }
    get position() {
        return this.group.position
    }
    makeFloor(width, depth, position){
        let floor = MeshBuilder.CreateBox(1, { width, depth, height: .25 }, this.scene)
        
        floor.visibility = .52
        floor.position = position 
        floor.parent = this.group

        this.floor.push(floor)
    }
    canAcceptNext(nextType, _path){
        return this.illegalNext.length ? !this.illegalNext.includes(nextType) : true
    } 
    remove() {
        this.group.dispose()
    }
    addCoin(position, time){ 
        let coin = clone("coin") 
        
        resize(coin, .3, .6, .3)
        
        coin.time = time
        coin.position = position
        coin.parent = this.group

        this.coins.push(coin)
    }
    addCoinLine(count, start, end, origin = new Vector3(0, .25, 0)) { 
        let gapX = (end.x - start.x) / (count - 1)
        let gapY = (end.y - start.y) / (count - 1)
        let gapZ = (end.z - start.z) / (count - 1) 

        for (let i = 0; i < count; i++) {
            let position = new Vector3(gapX * i + origin.x, gapY * i + origin.y, gapZ * i + origin.z)

            this.addCoin(position, i * .1)
        }
    }
    beforeRender(player) {  
        for (let coin of this.coins) {
            let distance = Vector3.DistanceSquared(coin.getAbsolutePosition(), player.getAbsolutePosition())

            coin.rotate(Axis.Y, coin.rotation.y + .035)

            if (distance < .25) {
                player.score++ 
                coin.dispose() 
                this.coins = this.coins.filter(i => i !== coin)
            }
        }
    }
}
